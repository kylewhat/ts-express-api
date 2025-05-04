import mongoose, { Schema, Document } from 'mongoose';

export interface IState extends Document {
  stateCode: string;
  funfacts: string[];
}

const stateSchema: Schema = new Schema<IState>({
  stateCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  funfacts: {
    type: [String]
  }
});

export default mongoose.model<IState>('State', stateSchema);
