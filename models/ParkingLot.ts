import mongoose, { Schema, Document } from 'mongoose';

export interface IParkingLot extends Document {
  _id: string;
  name: string;
  operatorUserId: mongoose.Types.ObjectId;
  location: {
    address: string;
    geo: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  pricing: {
    hourly: number;
    dailyMax?: number;
  };
  capacity: number;
  availabilityManual: number;
  amenities?: string[];
  status: 'ACTIVE' | 'INACTIVE';
  subscription: {
    plan: 'BASIC' | 'PLUS';
    status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
    provider: 'stripe';
    stripeCustomerId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ParkingLotSchema = new Schema<IParkingLot>({
  name: {
    type: String,
    required: true
  },
  operatorUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    geo: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  pricing: {
    hourly: {
      type: Number,
      required: true
    },
    dailyMax: Number
  },
  capacity: {
    type: Number,
    required: true
  },
  availabilityManual: {
    type: Number,
    required: true,
    default: 0
  },
  amenities: [String],
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['BASIC', 'PLUS'],
      default: 'BASIC'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAST_DUE', 'CANCELLED'],
      default: 'ACTIVE'
    },
    provider: {
      type: String,
      default: 'stripe'
    },
    stripeCustomerId: String
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
ParkingLotSchema.index({ 'location.geo': '2dsphere' });

export default mongoose.models.ParkingLot || mongoose.model<IParkingLot>('ParkingLot', ParkingLotSchema);
