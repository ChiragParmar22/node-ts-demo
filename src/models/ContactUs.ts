import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IContactUs extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactUsSchema = new Schema<IContactUs>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'contactUs' }
);

export const ContactUs = mongoose.model<IContactUs>(
  'contactUs',
  ContactUsSchema
);
