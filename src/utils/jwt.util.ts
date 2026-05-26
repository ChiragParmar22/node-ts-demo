import jwt from 'jsonwebtoken';

import config from '../configs/common.config';

export default class JwtUtil {
  static generateToken(payload: { id: string }): string {
    const options: jwt.SignOptions = {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    };
    return jwt.sign(payload, config.jwt.secret, options);
  }

  static async verifyToken(token: string): Promise<{ id: string }> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        config.jwt.secret,
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
          resolve(decoded as { id: string });
        }
      );
    });
  }
}
