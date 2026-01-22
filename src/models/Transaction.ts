import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  reference?: string; // Stripe payment intent ID, VPS ID, etc.
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'EUR',
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      sparse: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ reference: 1 });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
