import mongoose, { Document, Schema } from "mongoose";

interface IOrganization extends Document {
  name: string;
  password: string;
  description: string;
  phoneNumber: string;
  contactEmail: string;
}

const OrganizationSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
    unique: true,
  },
});

const Organization = mongoose.model<IOrganization>(
  "Organization",
  OrganizationSchema,
);
export default Organization;
