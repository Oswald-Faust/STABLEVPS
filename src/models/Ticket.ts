import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage {
  sender: 'user' | 'admin';
  content: string;
  createdAt: Date;
}

export interface ITicket extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ticketNumber: string;
  subject: string;
  department: 'technical' | 'billing' | 'sales' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'answered' | 'customer_reply' | 'closed';
  messages: IMessage[];
  relatedService?: string; // VPS ID or service reference
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TicketSchema = new Schema<ITicket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ticketNumber: {
      type: String,
      unique: true,
      // Not required - generated automatically in pre-save hook
    },
    subject: {
      type: String,
      required: true,
      maxlength: 200,
    },
    department: {
      type: String,
      enum: ['technical', 'billing', 'sales', 'general'],
      default: 'technical',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'answered', 'customer_reply', 'closed'],
      default: 'open',
    },
    messages: [MessageSchema],
    relatedService: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ createdAt: -1 });

// Generate ticket number before save
TicketSchema.pre('save', async function () {
  if (this.isNew && !this.ticketNumber) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.ticketNumber = `#${randomNum}`;
  }
});

const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
