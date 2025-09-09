import mongoose, { Document, Schema } from "mongoose";

interface INominee extends Document {
  fullName: string;
  description?: string;
  category: string;
  event: string;
  imageURL?: string;
  dynamicFields: { [key: string]: any }; // Store dynamic form data
  voteCount: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const NomineeSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    imageURL: {
      type: String,
      required: false,
      trim: true,
    },
    dynamicFields: {
      type: Schema.Types.Mixed,
      default: {},
    },
    voteCount: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for efficient queries
NomineeSchema.index({ event: 1, category: 1 });
NomineeSchema.index({ event: 1, voteCount: -1 });
NomineeSchema.index({ category: 1, voteCount: -1 });

const Nominee = mongoose.model<INominee>("Nominee", NomineeSchema);

export default Nominee;
