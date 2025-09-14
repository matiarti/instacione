import mongoose, { Schema, Document } from 'mongoose';

export interface IOperatorSubscription extends Document {
  _id: string;
  operatorId: string; // Reference to User._id
  planId: string; // Reference to SubscriptionPlan._id
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OperatorSubscriptionSchema = new Schema<IOperatorSubscription>({
  operatorId: {
    type: String,
    required: true,
    ref: 'User'
  },
  planId: {
    type: String,
    required: true,
    ref: 'SubscriptionPlan'
  },
  stripeSubscriptionId: {
    type: String,
    required: false
  },
  stripeCustomerId: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing'],
    default: 'active'
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  trialEnd: Date
}, {
  timestamps: true
});

// Index for efficient queries
OperatorSubscriptionSchema.index({ operatorId: 1 });
OperatorSubscriptionSchema.index({ stripeSubscriptionId: 1 });

export default mongoose.models.OperatorSubscription || mongoose.model<IOperatorSubscription>('OperatorSubscription', OperatorSubscriptionSchema);
