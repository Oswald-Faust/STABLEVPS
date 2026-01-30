import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferral extends Document {
  _id: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId; // The user who made the referral (parrain)
  refereeId: mongoose.Types.ObjectId;  // The user who was referred (filleul)
  status: 'pending' | 'completed' | 'expired';
  discountApplied: number; // Discount percentage applied to referee (10%)
  commissionRate: number;  // Commission rate for referrer (10%)
  commissionAmount: number; // Actual amount earned by referrer
  orderAmount: number;     // Amount of the order that triggered this
  orderId?: string;        // Reference to the order/subscription
  stripeSessionId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refereeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'expired'],
      default: 'pending',
    },
    discountApplied: {
      type: Number,
      default: 10, // 10%
    },
    commissionRate: {
      type: Number,
      default: 10, // 10%
    },
    commissionAmount: {
      type: Number,
      default: 0,
    },
    orderAmount: {
      type: Number,
      default: 0,
    },
    orderId: {
      type: String,
      sparse: true,
    },
    stripeSessionId: {
      type: String,
      sparse: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ReferralSchema.index({ referrerId: 1, status: 1 });
ReferralSchema.index({ refereeId: 1 });
ReferralSchema.index({ createdAt: -1 });

const Referral: Model<IReferral> = mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);

export default Referral;
