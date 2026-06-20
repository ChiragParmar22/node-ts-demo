import { Types } from 'mongoose';

import config from '../configs/common.config';
import { DeviceType } from '../constants/key.constants';
import UserSessionRepository from '../repositories/userSession.repository';
import JwtUtil from '../utils/jwt.util';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export default class SessionService {
  static async createSession(
    userId: string,

    deviceId: string,
    deviceType: DeviceType,
    deviceToken?: string | null
  ): Promise<AuthTokens> {
    await UserSessionRepository.deleteByUserIdAndDeviceId(userId, deviceId);

    const sessionId = new Types.ObjectId();
    const sessionIdStr = sessionId.toString();

    const accessToken = JwtUtil.generateAccessToken({
      id: userId,
      sessionId: sessionIdStr,
    });
    const refreshToken = JwtUtil.generateRefreshToken({
      id: userId,
      sessionId: sessionIdStr,
    });

    const now = Date.now();
    const accessTokenExpiresAt = new Date(
      now + JwtUtil.getTokenExpiryMs(config.jwt.expiresIn)
    );
    const refreshTokenExpiresAt = new Date(
      now + JwtUtil.getTokenExpiryMs(config.jwt.refreshExpiresIn)
    );

    await UserSessionRepository.create({
      _id: sessionId,
      userId: new Types.ObjectId(userId),
      deviceType,
      deviceId,
      deviceToken,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    });

    return { accessToken, refreshToken };
  }

  static async refreshAccessToken(
    refreshToken: string,
    deviceId: string
  ): Promise<AuthTokens> {
    const payload = await JwtUtil.verifyRefreshToken(refreshToken);
    const session =
      await UserSessionRepository.findByRefreshToken(refreshToken);

    if (
      !session ||
      session._id.toString() !== payload.sessionId ||
      session.userId.toString() !== payload.id ||
      session.deviceId !== deviceId ||
      session.refreshToken !== refreshToken
    ) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const accessToken = JwtUtil.generateAccessToken({
      id: payload.id,
      sessionId: payload.sessionId,
    });
    const accessTokenExpiresAt = new Date(
      Date.now() + JwtUtil.getTokenExpiryMs(config.jwt.expiresIn)
    );

    const newRefreshToken = JwtUtil.generateRefreshToken({
      id: payload.id,
      sessionId: payload.sessionId,
    });
    const refreshTokenExpiresAt = new Date(
      Date.now() + JwtUtil.getTokenExpiryMs(config.jwt.refreshExpiresIn)
    );

    await UserSessionRepository.updateAccessAndRefreshTokens(
      session._id,
      accessToken,
      accessTokenExpiresAt,
      newRefreshToken,
      refreshTokenExpiresAt
    );

    return { accessToken, refreshToken };
  }

  static async revokeSession(sessionId: string): Promise<void> {
    await UserSessionRepository.deleteById(sessionId);
  }

  static async revokeAllSessions(
    userId: string | Types.ObjectId
  ): Promise<void> {
    await UserSessionRepository.deleteAllByUserId(userId);
  }
}
