import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  lotId: mongoose.Types.ObjectId;
  state: 'PENDING_PAYMENT' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED' | 'NO_SHOW' | 'CHECKED_IN' | 'CHECKED_OUT';
  arrivalWindow: {
    start: Date;
    end: Date;
  };
  car: {
    plate: string;
  };
  priceEstimate: {
    hourly: number;
    expectedHours?: number;
  };
  fees: {
    reservationPct: number;
    reservationFeeAmount: number;
  };
  payment: {
    provider: 'stripe';
    intentId?: string;
    status: 'REQUIRES_PAYMENT' | 'PAID' | 'REFUNDED' | 'FAILED';
  };
  checkinAt?: Date;
  checkoutAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lotId: {
    type: Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: true
  },
  state: {
    type: String,
    enum: ['PENDING_PAYMENT', 'CONFIRMED', 'EXPIRED', 'CANCELLED', 'NO_SHOW', 'CHECKED_IN', 'CHECKED_OUT'],
    default: 'PENDING_PAYMENT'
  },
  arrivalWindow: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  car: {
    plate: {
      type: String,
      required: true
    }
  },
  priceEstimate: {
    hourly: {
      type: Number,
      required: true
    },
    expectedHours: Number
  },
  fees: {
    reservationPct: {
      type: Number,
      required: true
    },
    reservationFeeAmount: {
      type: Number,
      required: true
    }
  },
  payment: {
    provider: {
      type: String,
      default: 'stripe'
    },
    intentId: String,
    status: {
      type: String,
      enum: ['REQUIRES_PAYMENT', 'PAID', 'REFUNDED', 'FAILED'],
      default: 'REQUIRES_PAYMENT'
    }
  },
  checkinAt: Date,
  checkoutAt: Date
}, {
  timestamps: true
});

// Create TTL index for pending reservations (expire after 10 minutes)
ReservationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

// Create compound indexes for efficient queries
ReservationSchema.index({ lotId: 1, state: 1 });
ReservationSchema.index({ userId: 1, state: 1 });

export default mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);
