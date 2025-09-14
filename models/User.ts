import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  role: 'DRIVER' | 'OPERATOR' | 'ADMIN';
  name: string;
  email: string;
  phone?: string;
  car?: {
    plate?: string;
    model?: string;
    color?: string;
  };
  password?: string;
  provider?: 'credentials' | 'google' | 'email';
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  role: {
    type: String,
    enum: ['DRIVER', 'OPERATOR', 'ADMIN'],
    default: 'DRIVER'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: String,
  car: {
    plate: String,
    model: String,
    color: String
  },
  password: String,
  provider: {
    type: String,
    enum: ['credentials', 'google', 'email'],
    default: 'credentials'
  },
  providerId: String
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
