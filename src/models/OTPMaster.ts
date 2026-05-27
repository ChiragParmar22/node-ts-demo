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
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    expireAt: { type: Date, default: Date.now, index: { expires: '10m' } },
  },
  { collection: 'otpMaster' }
);

export const OTPMaster = mongoose.model<IOTPMaster>(
  'otpMaster',
  OTPMasterSchema
);
