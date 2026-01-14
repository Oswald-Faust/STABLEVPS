import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

// Individual VPS/Subscription interface
export interface IVPSSubscription {
  _id?: mongoose.Types.ObjectId;
  // Subscription details
  planId: "basic" | "prime" | "pro";
  billingCycle: "monthly" | "yearly";
  status: "active" | "canceled" | "past_due" | "trialing" | "pending";
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  // VPS details
  serverId?: string;
  ipAddress?: string;
  location: string;
  vpsStatus: "provisioning" | "active" | "suspended" | "terminated";
  rdpUsername?: string;
  rdpPassword?: string;
  createdAt?: Date;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  role: "user" | "admin";
  password: string;
  firstName: string;
  lastName: string;
  stripeCustomerId?: string;
  balance: number;
  address?: {
    street?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  };
  // Array of VPS subscriptions - supports multiple VPS per user
  services: IVPSSubscription[];
  // Legacy fields for backward compatibility (deprecated)
  subscription?: {
    planId: "basic" | "prime" | "pro";
    billingCycle: "monthly" | "yearly";
    status: "active" | "canceled" | "past_due" | "trialing" | "pending";
    stripeSubscriptionId?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
  };
  vps?: {
    serverId?: string;
    ipAddress?: string;
    location: string;
    status: "provisioning" | "active" | "suspended" | "terminated";
    rdpUsername?: string;
    rdpPassword?: string;
    createdAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// VPS Subscription sub-schema
const VPSSubscriptionSchema = new Schema({
  // Subscription details
  planId: {
    type: String,
    enum: ["basic", "prime", "pro"],
    required: true,
  },
  billingCycle: {
    type: String,
    enum: ["monthly", "yearly"],
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "canceled", "past_due", "trialing", "pending"],
    default: "pending",
  },
  stripeSubscriptionId: String,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  // VPS details
  serverId: String,
  ipAddress: String,
  location: {
    type: String,
    enum: ["london", "amsterdam", "frankfurt", "newYork", "singapore", "tokyo"],
    required: true,
  },
  vpsStatus: {
    type: String,
    enum: ["provisioning", "active", "suspended", "terminated"],
    default: "provisioning",
  },
  rdpUsername: String,
  rdpPassword: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    stripeCustomerId: {
      type: String,
      unique: true,
      sparse: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    address: {
      street: String,
      city: String,
      zipCode: String,
      country: String,
    },
    // Array of VPS services
    services: {
      type: [VPSSubscriptionSchema],
      default: [],
    },
    // Legacy fields - kept for backward compatibility
    subscription: {
      planId: {
        type: String,
        enum: ["basic", "prime", "pro"],
      },
      billingCycle: {
        type: String,
        enum: ["monthly", "yearly"],
      },
      status: {
        type: String,
        enum: ["active", "canceled", "past_due", "trialing", "pending"],
        default: "pending",
      },
      stripeSubscriptionId: String,
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
    },
    vps: {
      serverId: String,
      ipAddress: String,
      location: {
        type: String,
        enum: ["london", "amsterdam", "frankfurt", "newYork", "singapore", "tokyo"],
      },
      status: {
        type: String,
        enum: ["provisioning", "active", "suspended", "terminated"],
        default: "provisioning",
      },
      rdpUsername: String,
      rdpPassword: String,
      createdAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// In development, delete the model from cache if schema may have changed
if (process.env.NODE_ENV === 'development' && mongoose.models.User) {
  delete mongoose.models.User;
}

// Prevent model recompilation in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

