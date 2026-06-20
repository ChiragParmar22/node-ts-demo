import { Types } from 'mongoose';

import { IUserSessions, UserSessions } from '../models/UserSessions';

export default class UserSessionRepository {
  static async create(data: Partial<IUserSessions>): Promise<IUserSessions> {
    return await UserSessions.create(data);
  }

  static async findById(
    id: string | Types.ObjectId
  ): Promise<IUserSessions | null> {
    return await UserSessions.findById(id);
  }

  static async findByRefreshToken(
    refreshToken: string
  ): Promise<IUserSessions | null> {
    return await UserSessions.findOne({
      refreshToken,
      refreshTokenExpiresAt: { $gt: new Date() },
    });
  }

  static async updateAccessAndRefreshTokens(
    id: string | Types.ObjectId,
    accessToken: string,
    accessTokenExpiresAt: Date,
    refreshToken: string,
    refreshTokenExpiresAt: Date
  ): Promise<IUserSessions | null> {
    return await UserSessions.findByIdAndUpdate(
      id,
      {
        accessToken,
        accessTokenExpiresAt,
        refreshToken,
        refreshTokenExpiresAt,
        updatedAt: new Date(),
      },
      { new: true }
    );
  }

  static async deleteByUserIdAndDeviceId(
    userId: string | Types.ObjectId,
    deviceId: string
  ): Promise<void> {
    await UserSessions.deleteMany({ userId, deviceId });
  }

  static async deleteById(id: string | Types.ObjectId): Promise<void> {
    await UserSessions.findByIdAndDelete(id);
  }

  static async deleteAllByUserId(
    userId: string | Types.ObjectId
  ): Promise<void> {
    await UserSessions.deleteMany({ userId });
  }
}
