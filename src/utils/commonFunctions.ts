import fs from 'fs';
import path from 'path';

import config from '../configs/common.config';

export default class CommonFunctions {
  static generateOtp(length = 4): string {
    if (config.NODE_ENV === 'dev') {
      return String(config.TEST_OTP).padStart(length, '0');
    }

    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }

    return otp;
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
