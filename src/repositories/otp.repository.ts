import { LessThanOrEqual, MoreThan } from 'typeorm';

import { AppDataSource } from '../database/dbConnection';
import { OTPMaster } from '../database/entities/OTPMaster';

export default class OtpRepository {
  private static readonly OTP_EXPIRY_MINUTES = 10;

  private static get repository() {
    return AppDataSource.getRepository(OTPMaster);
  }

  private static buildExpireAt(): Date {
    const expireAt = new Date();
    expireAt.setMinutes(expireAt.getMinutes() + this.OTP_EXPIRY_MINUTES);
    return expireAt;
  }

  static async deleteExpiredOTPs(email?: string): Promise<void> {
    await this.repository.delete({
      ...(email ? { email } : {}),
      expireAt: LessThanOrEqual(new Date()),
    });
  }

  static async createOtp(data: Partial<OTPMaster>): Promise<OTPMaster> {
    const otp = this.repository.create({
      ...data,
      expireAt: data.expireAt ?? this.buildExpireAt(),
    });

    return await this.repository.save(otp);
  }

  static async updateOtp(
    id: string,
    data: Partial<OTPMaster>
  ): Promise<boolean> {
    const expireAt = this.buildExpireAt();
    data.expireAt = expireAt;

    await this.repository.update(id, data);

    return true;
  }

  static async findByEmail(email: string): Promise<OTPMaster | null> {
    await this.deleteExpiredOTPs(email);

    return await this.repository.findOne({
      where: { email, expireAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    });
  }

  static async deleteOtp(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
