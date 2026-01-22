import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  invoiceNumber: string; // Format: INV-YYYYMM-XXXX
  userId: mongoose.Types.ObjectId;
  type: 'wallet_topup' | 'subscription' | 'service';
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: {
    type: 'card' | 'bank_transfer' | 'wallet' | 'other';
    last4?: string;
    brand?: string;
  };
  description: string;
  transactionId?: mongoose.Types.ObjectId; // Reference to Transaction
  stripePaymentIntentId?: string;
  stripeSubscriptionId?: string; // For subscription invoices
  stripeSessionId?: string;
  metadata?: {
    previousBalance?: number;
    newBalance?: number;
    [key: string]: unknown;
  };
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['wallet_topup', 'subscription', 'service'],
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
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: {
        type: String,
        enum: ['card', 'bank_transfer', 'wallet', 'other'],
        default: 'card',
      },
      last4: String,
      brand: String,
    },
    description: {
      type: String,
      required: true,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      sparse: true,
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true,
    },
    stripeSessionId: {
      type: String,
      sparse: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
InvoiceSchema.index({ userId: 1, createdAt: -1 });
InvoiceSchema.index({ type: 1, status: 1 });

// Static method to generate invoice number
InvoiceSchema.statics.generateInvoiceNumber = async function(): Promise<string> {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Find the last invoice of this month
  const lastInvoice = await this.findOne({
    invoiceNumber: new RegExp(`^INV-${yearMonth}-`)
  }).sort({ invoiceNumber: -1 });
  
  let sequenceNumber = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10);
    sequenceNumber = lastSequence + 1;
  }
  
  return `INV-${yearMonth}-${String(sequenceNumber).padStart(4, '0')}`;
};

// Add the static method type
interface IInvoiceModel extends Model<IInvoice> {
  generateInvoiceNumber(): Promise<string>;
}

// In development, delete the model from cache if schema may have changed
// This is a workaround for hot reloading issues
if (process.env.NODE_ENV === 'development' && mongoose.models.Invoice) {
  delete mongoose.models.Invoice;
}

const Invoice: IInvoiceModel = (mongoose.models.Invoice || mongoose.model<IInvoice, IInvoiceModel>('Invoice', InvoiceSchema)) as IInvoiceModel;

export default Invoice;

