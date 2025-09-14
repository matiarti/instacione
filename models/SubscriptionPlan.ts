import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  _id: string;
  name: string;
  description: string;
  price: number; // Monthly price in cents
  currency: string;
  features: string[];
  maxParkingLots: number;
  maxReservationsPerMonth: number;
  stripePriceId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'BRL'
  },
  features: [{
    type: String,
    required: true
  }],
  maxParkingLots: {
    type: Number,
    required: true,
    default: 1
  },
  maxReservationsPerMonth: {
    type: Number,
    required: true,
    default: 100
  },
  stripePriceId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.SubscriptionPlan || mongoose.model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);
