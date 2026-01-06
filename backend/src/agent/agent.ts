import { z } from 'zod';
import { llm } from '../llm/index.js';
import { tools, type ToolName, type ToolContext, type ToolResult } from './tools.js';
import { AGENT_SYSTEM_PROMPT, TOOL_DESCRIPTIONS } from './prompts.js';

// Schema for agent's tool selection
const ToolCallSchema = z.object({
  tool: z.enum(['get_status', 'complete_goal', 'update_goal_progress', 'add_goal', 'log_manifestation', 'add_manifestation', 'none']),
  parameters: z.record(z.any()).optional(),
  reasoning: z.string(),
});

// Action returned in response
export interface AgentAction {
  type: string;
  targetId?: string;
  details: Record<string, any>;
}

// Agent response
export interface AgentResponse {
  message: string;
  actions: AgentAction[];
  toolResults: ToolResult[];
}

export class Agent {
  private context: ToolContext;

  constructor(userId: string) {
    this.context = { userId };
  }

  async processMessage(userMessage: string): Promise<AgentResponse> {
    const actions: AgentAction[] = [];
    const toolResults: ToolResult[] = [];

    // Step 1: Determine which tool to use (if any)
    const toolSelectionPrompt = `${AGENT_SYSTEM_PROMPT}

Available tools:
${Object.entries(TOOL_DESCRIPTIONS).map(([name, desc]) => `- ${name}: ${desc}`).join('\n')}

User message: "${userMessage}"

Analyze the user's message and determine:
1. Which tool (if any) should be used
2. What parameters to pass to the tool
3. Your reasoning

If no tool is needed (just a general conversation), use tool "none".`;

    let toolCall: z.infer<typeof ToolCallSchema>;
    
    try {
      toolCall = await llm.generateStructured(toolSelectionPrompt, ToolCallSchema);
    } catch (error) {
      console.error('Tool selection error:', error);
      toolCall = { tool: 'none', reasoning: 'Error in processing' };
    }

    // Step 2: Execute the tool if selected
    if (toolCall.tool !== 'none' && toolCall.tool in tools) {
      const tool = tools[toolCall.tool as ToolName];
      try {
        const params = toolCall.parameters || {};
        const result = await tool.execute(params as any, this.context);
        toolResults.push(result);
        
        if (result.success && result.data) {
          actions.push({
            type: toolCall.tool,
            targetId: result.data.goal?.id || result.data.manifestation?.id,
            details: result.data,
          });
        }
      } catch (error) {
        console.error(`Tool execution error (${toolCall.tool}):`, error);
        toolResults.push({
          success: false,
          message: `Failed to execute ${toolCall.tool}`,
        });
      }
    }

    // Step 3: Generate natural language response
    const responsePrompt = `${AGENT_SYSTEM_PROMPT}

User said: "${userMessage}"

${toolResults.length > 0 ? `
Tool used: ${toolCall.tool}
Tool result: ${JSON.stringify(toolResults[0])}
` : ''}

Generate a brief, encouraging response (1-2 sentences). Be warm and celebratory if something was accomplished.`;

    let message: string;
    try {
      message = await llm.generateText(responsePrompt, { temperature: 0.8, maxTokens: 150 });
    } catch (error) {
      console.error('Response generation error:', error);
      // Fallback response
      if (toolResults.length > 0 && toolResults[0].success) {
        message = toolResults[0].message;
      } else {
        message = "I've noted that. Keep up the great work! 💪";
      }
    }

    return {
      message: message.trim(),
      actions,
      toolResults,
    };
  }
}

// Factory function
export function createAgent(userId: string): Agent {
  return new Agent(userId);
}
