import mongoose, { Document, Schema } from "mongoose";

interface IEvents extends Document {
  name: string;
  event: string;
  slug: string;
  description: string;
  eventImage: string;
  price: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    eventImage: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Event = mongoose.model<IEvents>("Event", EventSchema);
export default Event;
