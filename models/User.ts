import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  role: 'DRIVER' | 'OPERATOR' | 'ADMIN';
  name: string;
  email: string;
  phone?: string;
  cars?: Array<{
    _id?: string;
    plate?: string;
    model?: string;
    color?: string;
    brand?: string;
    modelVersion?: string;
    manufacturingYear?: number;
    modelYear?: number;
    numberOfDoors?: number;
    fuelType?: string;
    accessoryPackage?: string;
    estimatedValue?: number;
    isDefault?: boolean;
  }>;
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
  cars: [{
    plate: String,
    model: String,
    color: String,
    brand: String,
    modelVersion: String,
    manufacturingYear: Number,
    modelYear: Number,
    numberOfDoors: Number,
    fuelType: String,
    accessoryPackage: String,
    estimatedValue: Number,
    isDefault: { type: Boolean, default: false }
  }],
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
