import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOTPMaster extends Document {
  _id: Types.ObjectId;
  email: string;
  otp: string;
  createdAt: Date;
  expireAt: Date;
}

const OTPMasterSchema = new Schema<IOTPMaster>(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    expireAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      expires: 0, // TTL index
    },
  },
  { collection: 'otpMaster' }
);

export const OTPMaster = mongoose.model<IOTPMaster>(
  'otpMaster',
  OTPMasterSchema
);
