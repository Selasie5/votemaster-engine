import mongoose, { Document, Schema } from "mongoose";

interface IUSSDSession extends Document {
  sessionId: string;
  phoneNumber: string;
  currentStep: string;
  sessionData: {
    selectedEvent?: string;
    selectedCategory?: string;
    selectedNominee?: string;
    amount?: number;
    transactionId?: string;
    userInputs?: any[];
  };
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const USSDSessionSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      index: true,
    },
    currentStep: {
      type: String,
      required: true,
      default: 'MAIN_MENU',
    },
    sessionData: {
      selectedEvent: {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
      selectedCategory: {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
      selectedNominee: {
        type: Schema.Types.ObjectId,
        ref: "Nominee",
      },
      amount: Number,
      transactionId: String,
      userInputs: [Schema.Types.Mixed],
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically delete expired sessions

USSDSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
USSDSessionSchema.index({ phoneNumber: 1, status: 1 });

const USSDSession = mongoose.model<IUSSDSession>("USSDSession", USSDSessionSchema);
export default USSDSession;
