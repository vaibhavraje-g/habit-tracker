import { Injectable, signal, computed } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface AgentResponse {
  message: string;
  actions: any[];
  updatedData?: {
    score: number;
    history: number[];
    goals: any[];
    manifestations: any[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private socket: Socket | null = null;
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private preferredVoice: SpeechSynthesisVoice | null = null;

  // State signals
  private _state = signal<VoiceState>('idle');
  private _transcript = signal('');
  private _response = signal('');
  private _isConnected = signal(false);
  private _error = signal<string | null>(null);

  // Public computed
  state = computed(() => this._state());
  transcript = computed(() => this._transcript());
  response = computed(() => this._response());
  isConnected = computed(() => this._isConnected());
  error = computed(() => this._error());

  // Event callbacks
  onDataUpdate: ((data: AgentResponse['updatedData']) => void) | null = null;

  constructor(private auth: AuthService) {
    this.initSpeechSynthesis();
  }

  // Initialize TTS
  private initSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      
      // Load voices (async in some browsers)
      const loadVoices = () => {
        const voices = this.synthesis!.getVoices();
        // Prefer a natural-sounding English voice
        this.preferredVoice = voices.find(v => 
          v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google'))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      };

      loadVoices();
      this.synthesis.onvoiceschanged = loadVoices;
    }
  }

  // Connect to Socket.IO
  connect() {
    if (this.socket?.connected) return;

    const token = localStorage.getItem('ascend_token');
    if (!token) {
      this._error.set('Not authenticated');
      return;
    }

    this.socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('🔌 Voice service connected');
      this._isConnected.set(true);
      this._error.set(null);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Voice service disconnected');
      this._isConnected.set(false);
    });

    this.socket.on('agent:thinking', () => {
      this._state.set('thinking');
    });

    this.socket.on('agent:response', (data: AgentResponse) => {
      this._response.set(data.message);
      
      // Update data in parent component
      if (data.updatedData && this.onDataUpdate) {
        this.onDataUpdate(data.updatedData);
      }

      // Speak the response
      this.speak(data.message);
    });

    this.socket.on('agent:error', (data: { error: string; message?: string }) => {
      this._error.set(data.error);
      this._state.set('error');
      if (data.message) {
        this._response.set(data.message);
        this.speak(data.message);
      }
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      this._error.set('Connection failed');
      this._isConnected.set(false);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this._isConnected.set(false);
  }

  // Start listening with Web Speech API
  startListening() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this._error.set('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this._state.set('listening');
    this._transcript.set('');
    this._response.set('');
    this._error.set(null);

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      this._transcript.set(finalTranscript || interimTranscript);
    };

    this.recognition.onend = () => {
      const transcript = this._transcript();
      if (transcript && transcript.trim()) {
        this.sendMessage(transcript.trim());
      } else {
        this._state.set('idle');
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        this._error.set(`Recognition error: ${event.error}`);
      }
      this._state.set('idle');
    };

    this.recognition.start();
  }

  // Stop listening
  stopListening() {
    this.recognition?.stop();
  }

  // Send text message to agent (for typed input or after STT)
  sendMessage(message: string) {
    if (!this.socket?.connected) {
      this.connect();
      // Wait for connection then send
      setTimeout(() => this.sendMessage(message), 500);
      return;
    }

    this._state.set('thinking');
    this._transcript.set(message);
    this.socket.emit('agent:message', { message });
  }

  // Text-to-Speech
  speak(text: string) {
    if (!this.synthesis) {
      this._state.set('idle');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this._state.set('speaking');
    };

    utterance.onend = () => {
      this._state.set('idle');
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this._state.set('idle');
    };

    this.synthesis.speak(utterance);
  }

  // Stop speaking
  stopSpeaking() {
    this.synthesis?.cancel();
    this._state.set('idle');
  }

  // Reset state
  reset() {
    this.stopListening();
    this.stopSpeaking();
    this._state.set('idle');
    this._transcript.set('');
    this._response.set('');
    this._error.set(null);
  }
}
