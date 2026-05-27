import { Types } from 'mongoose';

import { IOTPMaster, OTPMaster } from '../models/OTPMaster';

export default class OtpRepository {
  static async createOtp(data: Partial<IOTPMaster>): Promise<IOTPMaster> {
    return await OTPMaster.create(data);
  }

  static async findByEmail(email: string): Promise<IOTPMaster | null> {
    return await OTPMaster.findOne({
      email,
      expireAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
  }

  static async deleteOtp(id: string | Types.ObjectId): Promise<boolean> {
    await OTPMaster.findByIdAndDelete(id);
    return true;
  }
}
