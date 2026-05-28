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
    createdAt: { type: Date, default: Date.now },
    expireAt: {
      type: Date,
      default() {
        return new Date(Date.now() + 10 * 60 * 1000);
      },
      index: { expires: '10m' },
    },
  },
  { collection: 'otpMaster' }
);

export const OTPMaster = mongoose.model<IOTPMaster>(
  'otpMaster',
  OTPMasterSchema
);
