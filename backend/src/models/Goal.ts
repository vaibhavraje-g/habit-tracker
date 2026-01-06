import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGoal extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  subtitle: string;
  icon: string;
  progress: number;
  sparkline: number[];
  colorTheme: 'lime' | 'yellow' | 'emerald';
  status: 'active' | 'completed';
  frequency: 'daily' | 'weekly' | 'custom';
  targetPerWeek?: number;
  completedThisWeek: number;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: '🎯' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    sparkline: { type: [Number], default: () => Array(7).fill(0) },
    colorTheme: { type: String, enum: ['lime', 'yellow', 'emerald'], default: 'lime' },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    frequency: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'weekly' },
    targetPerWeek: { type: Number, default: 3 },
    completedThisWeek: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Update subtitle when progress changes
goalSchema.pre('save', function (next) {
  if (this.isModified('completedThisWeek') || this.isModified('targetPerWeek')) {
    this.subtitle = `${this.completedThisWeek} of ${this.targetPerWeek} this week`;
  }
  next();
});

export const Goal = mongoose.model<IGoal>('Goal', goalSchema);
