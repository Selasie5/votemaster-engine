import mongoose, { Document, Schema } from "mongoose";

interface IVote extends Document {
  event: string;
  category: string;
  nominee: string;
  voter: {
    phoneNumber?: string;
    email?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  voteChannel: 'USSD' | 'WEB' | 'MOBILE_APP';
  transactionId: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'MOBILE_MONEY' | 'CARD' | 'USSD';
  amountPaid: number;
  voteMasterFee: number;
  organizationAmount: number;
  metadata?: {
    ussdSessionId?: string;
    deviceInfo?: any;
    location?: {
      latitude?: number;
      longitude?: number;
      country?: string;
      region?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    nominee: {
      type: Schema.Types.ObjectId,
      ref: "Nominee",
      required: true,
      index: true,
    },
    voter: {
      phoneNumber: {
        type: String,
        sparse: true,
        index: true,
      },
      email: {
        type: String,
        sparse: true,
        index: true,
      },
      ipAddress: {
        type: String,
        required: true,
      },
      userAgent: {
        type: String,
      },
    },
    voteChannel: {
      type: String,
      enum: ['USSD', 'WEB', 'MOBILE_APP'],
      required: true,
      index: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['MOBILE_MONEY', 'CARD', 'USSD'],
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    voteMasterFee: {
      type: Number,
      required: true,
    },
    organizationAmount: {
      type: Number,
      required: true,
    },
    metadata: {
      ussdSessionId: String,
      deviceInfo: Schema.Types.Mixed,
      location: {
        latitude: Number,
        longitude: Number,
        country: String,
        region: String,
      },
    },
  },
  {
    timestamps: true,
  }
);


VoteSchema.index({ event: 1, nominee: 1 });
VoteSchema.index({ event: 1, category: 1 });
VoteSchema.index({ 'voter.phoneNumber': 1, event: 1 });
VoteSchema.index({ paymentStatus: 1, createdAt: -1 });
VoteSchema.index({ transactionId: 1, paymentStatus: 1 });

const Vote = mongoose.model<IVote>("Vote", VoteSchema);
export default Vote;
