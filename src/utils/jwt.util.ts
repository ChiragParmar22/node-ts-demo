import jwt from 'jsonwebtoken';

import config from '../configs/common.config';
import { JwtPayload, TokenType } from '../interfaces/user.interface';

const verifyOptions: jwt.VerifyOptions = { algorithms: ['HS256'] };

export default class JwtUtil {
  static generateAccessToken(payload: {
    id: string;
    sessionId: string;
  }): string {
    const options: jwt.SignOptions = {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
    };

    return jwt.sign(
      { ...payload, type: TokenType.ACCESS },
      config.jwt.secret,
      options
    );
  }

  static generateRefreshToken(payload: {
    id: string;
    sessionId: string;
  }): string {
    const options: jwt.SignOptions = {
      expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
    };

    return jwt.sign(
      { ...payload, type: TokenType.REFRESH },
      config.jwt.secret,
      options
    );
  }

  static getTokenExpiryMs(expiresIn: string | number): number {
    if (typeof expiresIn === 'number') {
      return expiresIn * 1000;
    }

    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) {
      return 12 * 60 * 60 * 1000;
    }

    const value = Number(match[1]);
    const unit = match[2] ?? 'h';
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (multipliers[unit] ?? 1000);
  }

  static async verifyAccessToken(token: string): Promise<JwtPayload> {
    return JwtUtil.verifyToken(token, TokenType.ACCESS);
  }

  static async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return JwtUtil.verifyToken(token, TokenType.REFRESH);
  }

  private static async verifyToken(
    token: string,
    expectedType: TokenType
  ): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        config.jwt.secret,
        verifyOptions,
        (
          err: jwt.VerifyErrors | null,
          decoded: string | jwt.JwtPayload | undefined
        ) => {
          if (err) {
            return reject(err);
          }
          if (!decoded || typeof decoded === 'string') {
            return reject(new Error('Invalid token payload'));
          }

          const payload = decoded as JwtPayload;
          if (
            payload.type !== expectedType ||
            !payload.id ||
            !payload.sessionId
          ) {
            return reject(new Error('Invalid token payload'));
          }

          resolve(payload);
        }
      );
    });
  }
}
