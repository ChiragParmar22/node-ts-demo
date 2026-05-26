import bcryptjs from 'bcryptjs';

import config from '../configs/common.config';

export default class BcryptjsUtil {
  static async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcryptjs.hash(
      password,
      config.PASSWORD_ENCRYPT_LEVEL
    );

    return hashedPassword;
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcryptjs.compare(password, hashedPassword);
  }
}
