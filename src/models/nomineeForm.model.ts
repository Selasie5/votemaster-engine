import mongoose, { Document, Schema } from "mongoose";

interface IFormField {
  fieldId: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'FILE' | 'DATE' | 'NUMBER' | 'EMAIL' | 'PHONE';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For SELECT, RADIO, CHECKBOX
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    errorMessage?: string;
  };
  order: number;
}

interface INomineeForm extends Document {
  event: string;
  category: string;
  formFields: IFormField[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema({
  fieldId: {
    type: String,
    required: true,
  },
  fieldType: {
    type: String,
    enum: ['TEXT', 'TEXTAREA', 'SELECT', 'RADIO', 'CHECKBOX', 'FILE', 'DATE', 'NUMBER', 'EMAIL', 'PHONE'],
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
  },
  required: {
    type: Boolean,
    default: false,
  },
  options: [{
    type: String,
  }],
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    errorMessage: String,
  },
  order: {
    type: Number,
    required: true,
  },
});

const NomineeFormSchema = new Schema(
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
    formFields: [FormFieldSchema],
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
  }
);


NomineeFormSchema.index({ event: 1, category: 1 });

const NomineeForm = mongoose.model<INomineeForm>("NomineeForm", NomineeFormSchema);
export default NomineeForm;
