import mongoose, { Document, Schema } from "mongoose";

interface IEvents extends Document {
  organization: string;
  name: string;
  slug: string;
  description: string;
  eventImage: string;
  pricePerVote: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
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
    pricePerVote: {
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

EventSchema.index({ name: 1, slug: 1 });

EventSchema.pre("deleteOne", { document: true }, async function (next) {
  await mongoose.model("Category").deleteMany({ eventId: this._id });
  await mongoose.model("Nominees").deleteMany({ eventId: this._id });
  await mongoose.model("Votes").deleteMany({ eventId: this._id });
  next();
});

const Event = mongoose.model<IEvents>("Event", EventSchema);
export default Event;
