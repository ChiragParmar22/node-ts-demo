import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import config from '../configs/common.config';

export default class CommonFunctions {
  static generateOtp(length = 6): string {
    if (config.NODE_ENV === 'dev') {
      return String(config.TEST_OTP).padStart(length, '0');
    }

    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += crypto.randomInt(0, 10).toString();
    }

    return otp;
  }

  static isOtpMatch(storedOtp: string, providedOtp: string): boolean {
    const stored = storedOtp.padStart(6, '0');
    const provided = providedOtp.padStart(6, '0');

    if (stored.length !== provided.length) {
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(provided));
  }

  static getImageUrl(imagePath?: string): string {
    if (!imagePath) return '';

    const filePath = path.join(__dirname, '../', imagePath);
    if (fs.existsSync(filePath)) {
      return `${config.SERVER_URL}/${imagePath}`;
    }

    return '';
  }
}
