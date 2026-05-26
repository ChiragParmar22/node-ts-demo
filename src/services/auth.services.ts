import { SocialLoginType } from '../constants/key.constants';
import messagesConstants from '../constants/messages.constants';
import { OTPMaster } from '../database/entities/OTPMaster';
import { Users } from '../database/entities/Users';
import {
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordInput,
  SendOtpInput,
  SocialLoginInput,
  VerifyOtpInput,
} from '../interfaces/user.interface';
import OtpRepository from '../repositories/otp.repository';
import UserRepository from '../repositories/user.repository';
import ApiResponse from '../utils/apiResponse';
import BcryptjsUtil from '../utils/bcryptjs.util';
import CommonFunctions from '../utils/commonFunctions';
import { forgotPasswordMail, registerMail } from '../utils/emailContent';
import JwtUtil from '../utils/jwt.util';
import sendEmail from '../utils/sendEmail';

/**
 * Remove sensitive fields from user object
 */
const sanitizeUser = (user: Users) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { password, ...safeUser } = user;

  safeUser.profilePicture = safeUser.profilePicture
    ? CommonFunctions.getImageUrl(
        `public/profilePictures/${safeUser.profilePicture}`
      )
    : null;

  return safeUser;
};

/**
 * Auth Service
 * Contains business logic for user authentication operations
 */
export default class AuthService {
  /**
   * Send OTP to email for registration
   * @param body - send otp input with email
   */
  static async sendOtp(body: SendOtpInput): Promise<ApiResponse> {
    const { email, name } = body;

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      if (existingUser.socialLoginType === SocialLoginType.GOOGLE) {
        return ApiResponse.badRequest(
          messagesConstants.USER_REGISTERED_WITH_GOOGLE
        );
      } else if (existingUser.socialLoginType === SocialLoginType.APPLE) {
        return ApiResponse.badRequest(
          messagesConstants.USER_REGISTERED_WITH_APPLE
        );
      }
      return ApiResponse.badRequest(messagesConstants.EMAIL_ALREADY_EXISTS);
    }

    if (body.countryCode && body.phoneNumber) {
      const existingPhoneNumber = await UserRepository.findByPhoneNumber(
        body.countryCode,
        body.phoneNumber
      );
      if (existingPhoneNumber) {
        return ApiResponse.badRequest(
          messagesConstants.PHONE_NUMBER_ALREADY_EXISTS
        );
      }
    }

    const otp = CommonFunctions.generateOtp();
    const otpData: Partial<OTPMaster> = { email, otp };

    const existingOtp = await OtpRepository.findByEmail(email);
    if (existingOtp) {
      await OtpRepository.updateOtp(existingOtp.id, otpData);
    } else {
      await OtpRepository.createOtp(otpData);
    }

    const emailContent = registerMail({
      name: name || 'User',
      otp,
    });

    await sendEmail(body.email, 'Registration OTP', emailContent);

    return ApiResponse.success({}, messagesConstants.OTP_SEND);
  }

  /**
   * Register new user
   * @param body - user register credentials
   * @param file - uploaded profile picture
   */
  static async register(
    body: RegisterInput,
    file?: Express.Multer.File
  ): Promise<ApiResponse> {
    const {
      name,
      email,
      countryCode,
      phoneNumber,
      socialLoginType,
      password,
      otp,
      appleId,
      googleId,
      deviceType,
      deviceToken,
      lat,
      lng,
    } = body;

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return ApiResponse.badRequest(messagesConstants.EMAIL_ALREADY_EXISTS);
    }

    if (countryCode && phoneNumber) {
      const existingPhoneNumber = await UserRepository.findByPhoneNumber(
        countryCode,
        phoneNumber
      );
      if (existingPhoneNumber) {
        return ApiResponse.badRequest(
          messagesConstants.PHONE_NUMBER_ALREADY_EXISTS
        );
      }
    }

    let hashedPassword: string | null = null;

    if (socialLoginType === SocialLoginType.EMAIL) {
      if (!password) {
        return ApiResponse.badRequest(
          messagesConstants.PASSWORD_REQUIRED_FOR_EMAIL_LOGIN
        );
      }

      const otpRecord = await OtpRepository.findByEmail(email);
      if (!otpRecord) {
        return ApiResponse.badRequest(messagesConstants.OTP_EXPIRED);
      }

      if (otpRecord.otp !== otp) {
        return ApiResponse.badRequest(messagesConstants.INVALID_OTP);
      }

      await OtpRepository.deleteOtp(otpRecord.id);

      hashedPassword = await BcryptjsUtil.hashPassword(password);
    } else {
      let userBySocialId: Users | null = null;
      if (socialLoginType === SocialLoginType.GOOGLE && googleId) {
        userBySocialId = await UserRepository.findUser({ googleId });
      } else if (socialLoginType === SocialLoginType.APPLE && appleId) {
        userBySocialId = await UserRepository.findUser({ appleId });
      }

      if (userBySocialId) {
        return ApiResponse.badRequest(
          messagesConstants.SOCIAL_ACCOUNT_ALREADY_REGISTERED
        );
      }
    }

    const userData = {
      name,
      email,
      countryCode,
      phoneNumber,
      socialLoginType,
      password: hashedPassword,
      appleId: socialLoginType === SocialLoginType.APPLE ? appleId : undefined,
      googleId:
        socialLoginType === SocialLoginType.GOOGLE ? googleId : undefined,
      profilePicture: file?.filename,
      deviceType,
      deviceToken,
      lat: lat !== undefined ? String(lat) : undefined,
      lng: lng !== undefined ? String(lng) : undefined,
    };

    const newUser = await UserRepository.createUser(userData);
    const token = JwtUtil.generateToken({ id: newUser.id });

    const result = { ...sanitizeUser(newUser), token };

    return ApiResponse.created(result, messagesConstants.ACCOUNT_CREATED);
  }

  /**
   * Sign in user
   * @param body - user login credentials
   */
  static async login(body: LoginInput): Promise<ApiResponse> {
    const { email, password, deviceType, deviceToken } = body;
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return ApiResponse.notFound(messagesConstants.USER_NOT_REGISTERED);
    }

    if (user.socialLoginType === SocialLoginType.GOOGLE) {
      return ApiResponse.badRequest(
        messagesConstants.USER_REGISTERED_WITH_GOOGLE
      );
    } else if (user.socialLoginType === SocialLoginType.APPLE) {
      return ApiResponse.badRequest(
        messagesConstants.USER_REGISTERED_WITH_APPLE
      );
    }

    if (!user.password) {
      return ApiResponse.badRequest(messagesConstants.INCORRECT_PASSWORD);
    }

    const isPasswordValid = await BcryptjsUtil.comparePassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return ApiResponse.badRequest(messagesConstants.INCORRECT_PASSWORD);
    }

    const updatedUser = await UserRepository.updateUserById(user.id, {
      deviceType,
      deviceToken,
      lat: String(body?.lat),
      lng: String(body?.lng),
    });
    if (!updatedUser) {
      return ApiResponse.notFound(messagesConstants.USER_NOT_REGISTERED);
    }

    const token = JwtUtil.generateToken({ id: user.id });

    const result = { ...sanitizeUser(updatedUser), token };

    return ApiResponse.success(result, messagesConstants.LOGIN_SUCCESSFULLY);
  }

  /**
   * Social Login
   * @param body - user social login credentials
   */
  static async socialLogin(body: SocialLoginInput): Promise<ApiResponse> {
    const {
      email,
      socialLoginType,
      appleId,
      googleId,
      deviceType,
      deviceToken,
    } = body;

    const userByEmail = await UserRepository.findByEmail(email);

    let userBySocialId: Users | null = null;
    if (socialLoginType === SocialLoginType.GOOGLE && googleId) {
      userBySocialId = await UserRepository.findUser({ googleId });
    } else if (socialLoginType === SocialLoginType.APPLE && appleId) {
      userBySocialId = await UserRepository.findUser({ appleId });
    }

    // Scenario 1: Neither exists
    if (!userByEmail && !userBySocialId) {
      return ApiResponse.notFound(messagesConstants.USER_NOT_REGISTERED);
    }

    let targetUser: Users;

    if (userBySocialId) {
      // Scenario 2: Both exist
      if (userByEmail) {
        if (userByEmail.id !== userBySocialId.id) {
          return ApiResponse.badRequest(
            messagesConstants.SOCIAL_ACCOUNT_LINKED_TO_OTHER_EMAIL
          );
        }
        targetUser = userByEmail;
      }
      // Scenario 3: Social ID user exists, but email user does not exist (or doesn't match)
      else {
        return ApiResponse.badRequest(
          messagesConstants.SOCIAL_ACCOUNT_EMAIL_MISMATCH
        );
      }
    }
    // Scenario 4: Email user exists, but Social ID user does not exist
    else {
      // Since userBySocialId is null, userByEmail must be non-null. We add a safe check here.
      if (!userByEmail) {
        return ApiResponse.notFound(messagesConstants.USER_NOT_REGISTERED);
      }

      // Check if this email is already linked to a different social account of the same type
      if (socialLoginType === SocialLoginType.GOOGLE && userByEmail.googleId) {
        return ApiResponse.badRequest(
          messagesConstants.EMAIL_ALREADY_LINKED_TO_OTHER_GOOGLE
        );
      }
      if (socialLoginType === SocialLoginType.APPLE && userByEmail.appleId) {
        return ApiResponse.badRequest(
          messagesConstants.EMAIL_ALREADY_LINKED_TO_OTHER_APPLE
        );
      }

      // Check registered login method policies
      if (userByEmail.socialLoginType === SocialLoginType.EMAIL) {
        return ApiResponse.badRequest(
          messagesConstants.USER_REGISTERED_WITH_EMAIL
        );
      } else if (userByEmail.socialLoginType === SocialLoginType.GOOGLE) {
        return ApiResponse.badRequest(
          messagesConstants.USER_REGISTERED_WITH_GOOGLE
        );
      } else if (userByEmail.socialLoginType === SocialLoginType.APPLE) {
        return ApiResponse.badRequest(
          messagesConstants.USER_REGISTERED_WITH_APPLE
        );
      }

      targetUser = userByEmail;
    }

    const updateData: Partial<Users> = {
      deviceType,
      deviceToken,
      lat: body.lat !== undefined ? String(body.lat) : undefined,
      lng: body.lng !== undefined ? String(body.lng) : undefined,
    };

    if (appleId) {
      updateData.appleId = appleId;
    }
    if (googleId) {
      updateData.googleId = googleId;
    }

    const updatedUser = await UserRepository.updateUserById(
      targetUser.id,
      updateData
    );
    if (!updatedUser) {
      return ApiResponse.notFound(messagesConstants.USER_NOT_REGISTERED);
    }

    const token = JwtUtil.generateToken({ id: targetUser.id });

    const result = { ...sanitizeUser(updatedUser), token };

    return ApiResponse.success(result, messagesConstants.LOGIN_SUCCESSFULLY);
  }

  /**
   * Handle user forgot password
   * @param email - user email
   */
  static async forgotPassword(body: SendOtpInput): Promise<ApiResponse> {
    const { email } = body;
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return ApiResponse.notFound(messagesConstants.USER_NOT_REGISTERED);
    }

    if (user.socialLoginType !== SocialLoginType.EMAIL || !user.password) {
      return ApiResponse.badRequest(
        messagesConstants.USER_REGISTERED_WITH_SOCIAL_LOGIN_FORGOT_PASSWORD
      );
    }

    const otp = CommonFunctions.generateOtp();
    const otpData: Partial<OTPMaster> = { email, otp };

    const existingOtp = await OtpRepository.findByEmail(email);
    if (existingOtp) {
      await OtpRepository.updateOtp(existingOtp.id, otpData);
    } else {
      await OtpRepository.createOtp(otpData);
    }

    const emailContent = forgotPasswordMail({
      name: user.name,
      otp,
    });

    await sendEmail(user.email, 'Forgot Password Mail', emailContent);

    return ApiResponse.success({}, messagesConstants.OTP_SEND);
  }

  /**
   * Handle user verify otp
   * @param body - user verify otp credentials
   */
  static async verifyOtp(body: VerifyOtpInput): Promise<ApiResponse> {
    const { email } = body;

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return ApiResponse.notFound(messagesConstants.USER_NOT_REGISTERED);
    }

    const otp = await OtpRepository.findByEmail(email);
    if (!otp) {
      return ApiResponse.badRequest(messagesConstants.OTP_EXPIRED);
    }

    if (otp.otp !== body.otp) {
      return ApiResponse.badRequest(messagesConstants.INVALID_OTP);
    }

    await OtpRepository.deleteOtp(otp.id);

    return ApiResponse.success({ id: user.id }, messagesConstants.OTP_VERIFIED);
  }

  /**
   * Handle user reset password
   * @param body - user reset password credentials
   */
  static async resetPassword(body: ResetPasswordInput): Promise<ApiResponse> {
    const { id, password } = body;

    const user = await UserRepository.findById(id);
    if (!user) {
      return ApiResponse.notFound(messagesConstants.USER_NOT_REGISTERED);
    }

    if (user.password) {
      const isPasswordSame = await BcryptjsUtil.comparePassword(
        password,
        user.password
      );
      if (isPasswordSame) {
        return ApiResponse.badRequest(messagesConstants.PASSWORD_ALREADY_USED);
      }
    }

    const hashedPassword = await BcryptjsUtil.hashPassword(password);
    await UserRepository.updateUserById(user.id, {
      password: hashedPassword,
    });

    return ApiResponse.success(
      {},
      messagesConstants.PASSWORD_RESET_SUCCESSFULLY
    );
  }

  /**
   * Handle refresh token
   * @param body - refresh token input with userId
   */
  static async refreshToken(body: RefreshTokenInput): Promise<ApiResponse> {
    const { userId, lat, lng } = body;

    const user = await UserRepository.findById(userId);
    if (!user) {
      return ApiResponse.notFound(messagesConstants.USER_NOT_FOUND);
    }

    if (lat && lng) {
      await UserRepository.updateUserById(user.id, {
        lat: String(lat),
        lng: String(lng),
      });
    }

    const token = JwtUtil.generateToken({ id: user.id });

    return ApiResponse.success(
      { token },
      messagesConstants.TOKEN_REFRESHED_SUCCESSFULLY
    );
  }
}
