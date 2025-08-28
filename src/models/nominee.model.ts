import mongoose, { Document, Schema } from "mongoose";

interface INominee extends Document {
  fullName: string;
  description: string;
  category: string;
  event: string;
  imageURL: string;
  createdAt: Date;
  updatedAt: Date;
}

const NomineeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    imageURL: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Nominee = mongoose.model<INominee>("Nominee", NomineeSchema);

export default Nominee;
