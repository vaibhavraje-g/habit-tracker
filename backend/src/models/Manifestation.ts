import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IManifestation extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  affirmation: string;
  technique: '3-6-9' | 'visualization' | 'scripting';
  streak: number;
  progress369?: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  lastPracticed?: Date;
  durationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const manifestationSchema = new Schema<IManifestation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    affirmation: { type: String, required: true, trim: true },
    technique: { type: String, enum: ['3-6-9', 'visualization', 'scripting'], required: true },
    streak: { type: Number, default: 0 },
    progress369: {
      morning: { type: Boolean, default: false },
      afternoon: { type: Boolean, default: false },
      evening: { type: Boolean, default: false },
    },
    lastPracticed: { type: Date },
    durationSeconds: { type: Number },
  },
  { timestamps: true }
);

export const Manifestation = mongoose.model<IManifestation>('Manifestation', manifestationSchema);
