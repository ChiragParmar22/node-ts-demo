import { DeviceType, SocialLoginType } from '../constants/key.constants';
import messagesConstants from '../constants/messages.constants';
import {
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordInput,
  SendOtpInput,
  SocialLoginInput,
} from '../interfaces/user.interface';
import { IOTPMaster } from '../models/OTPMaster';
import { IUsers } from '../models/Users';
import AppleUsersRepository from '../repositories/appleUsers.repository';
import OtpRepository from '../repositories/otp.repository';
import UserRepository from '../repositories/user.repository';
import ApiResponse from '../utils/apiResponse';
import BcryptjsUtil from '../utils/bcryptjs.util';
import CommonFunctions from '../utils/commonFunctions';
import { forgotPasswordMail, registerMail } from '../utils/emailContent';
import JwtUtil from '../utils/jwt.util';
import sendEmail from '../utils/sendEmail';

import SessionService from './session.service';

/**
 * Remove sensitive fields from user object
 */
const sanitizeUser = (user: IUsers) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const { password, __v, deletedAt, deleteReason, ...safeUser } = user.toJSON();

  safeUser.profilePicture = safeUser.profilePicture
    ? CommonFunctions.getImageUrl(
        `public/profilePictures/${safeUser.profilePicture}`
      )
    : null;

  return safeUser;
};

const issueAuthTokens = async (
  user: IUsers,
  deviceId: string,
  deviceType: DeviceType,
  deviceToken?: string | null
) => {
  const tokens = await SessionService.createSession(
    user._id.toString(),
    deviceId,
    deviceType,
    deviceToken
  );

  return { ...sanitizeUser(user), ...tokens };
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
    const canSendOtp =
      !existingUser &&
      !(
        body.countryCode &&
        body.phoneNumber &&
        (await UserRepository.findByPhoneNumber(
          body.countryCode,
          body.phoneNumber
        ))
      );

    if (canSendOtp) {
      const otp = CommonFunctions.generateOtp();
      const otpData: Partial<IOTPMaster> = { email, otp };

      const existingOtp = await OtpRepository.findByEmail(email);
      if (existingOtp) {
        await OtpRepository.deleteOtp(existingOtp._id);
      }

      await OtpRepository.createOtp(otpData);

      const emailContent = registerMail({
        name: name || 'User',
        otp,
      });

      await sendEmail(body.email, 'Registration OTP', emailContent);
    }

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
      socialId,
      deviceType,
      deviceId,
      deviceToken,
      lat = 0,
      lng = 0,
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

      if (!otp || !CommonFunctions.isOtpMatch(otpRecord.otp, otp)) {
        return ApiResponse.badRequest(messagesConstants.INVALID_OTP);
      }

      await OtpRepository.deleteOtp(otpRecord._id);

      hashedPassword = await BcryptjsUtil.hashPassword(password);
    } else {
      let userBySocialId: IUsers | null = null;
      if (socialId) {
        if (socialLoginType === SocialLoginType.GOOGLE) {
          userBySocialId = await UserRepository.findUser({ socialId });
        } else if (socialLoginType === SocialLoginType.APPLE) {
          userBySocialId = await UserRepository.findUser({ socialId });
        }
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
      socialId:
        socialLoginType !== SocialLoginType.EMAIL ? socialId : undefined,
      profilePicture: file?.filename,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    };

    const newUser = await UserRepository.createUser(userData);

    if (socialLoginType === SocialLoginType.APPLE && socialId) {
      await AppleUsersRepository.upsertByAppleId(socialId, email);
    }

    const result = await issueAuthTokens(
      newUser,
      deviceId,
      deviceType,
      deviceToken
    );

    return ApiResponse.created(result, messagesConstants.ACCOUNT_CREATED);
  }

  /**
   * Sign in user
   * @param body - user login credentials
   */
  static async login(body: LoginInput): Promise<ApiResponse> {
    const { email, password, deviceType, deviceId, deviceToken } = body;
    const user = await UserRepository.findByEmail(email);

    const isEmailLoginUser =
      user && user.socialLoginType === SocialLoginType.EMAIL && user.password;

    if (!isEmailLoginUser) {
      return ApiResponse.badRequest(messagesConstants.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await BcryptjsUtil.comparePassword(
      password,
      user.password as string
    );
    if (!isPasswordValid) {
      return ApiResponse.badRequest(messagesConstants.INVALID_CREDENTIALS);
    }

    const updatedUser = await UserRepository.updateUserById(user._id, {
      location: {
        type: 'Point',
        coordinates: [body?.lng ?? 0, body?.lat ?? 0],
      },
    });
    if (!updatedUser) {
      return ApiResponse.badRequest(messagesConstants.INVALID_CREDENTIALS);
    }

    const result = await issueAuthTokens(
      updatedUser,
      deviceId,
      deviceType,
      deviceToken
    );

    return ApiResponse.success(result, messagesConstants.LOGIN_SUCCESSFULLY);
  }

  /**
   * Social Login
   * @param body - user social login credentials
   */
  static async socialLogin(body: SocialLoginInput): Promise<ApiResponse> {
    let { email } = body;
    const { socialLoginType, socialId, deviceType, deviceId, deviceToken } =
      body;

    if (socialLoginType === SocialLoginType.APPLE && socialId) {
      if (email) {
        await AppleUsersRepository.upsertByAppleId(socialId, email);
      } else {
        const appleUser = await AppleUsersRepository.findByAppleId(socialId);
        if (!appleUser) {
          return ApiResponse.notFound(messagesConstants.USER_NOT_REGISTERED);
        }
        email = appleUser.email;
      }
    }

    if (!email)
      return ApiResponse.badRequest(messagesConstants.EMAIL_REQUIRED_FOR_LOGIN);

    const userByEmail = await UserRepository.findByEmail(email);

    let userBySocialId: IUsers | null = null;

    if (socialId) {
      if (socialLoginType === SocialLoginType.GOOGLE) {
        userBySocialId = await UserRepository.findUser({ socialId });
      } else if (socialLoginType === SocialLoginType.APPLE) {
        userBySocialId = await UserRepository.findUser({ socialId });
      }
    }

    // Scenario 1: Neither exists
    if (!userByEmail && !userBySocialId) {
      return ApiResponse.notFound(messagesConstants.USER_NOT_REGISTERED);
    }

    let targetUser: IUsers;

    if (userBySocialId) {
      // Scenario 2: Both exist
      if (userByEmail) {
        if (userByEmail._id.toString() !== userBySocialId._id.toString()) {
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
      if (socialLoginType === SocialLoginType.GOOGLE && userByEmail.socialId) {
        return ApiResponse.badRequest(
          messagesConstants.EMAIL_ALREADY_LINKED_TO_OTHER_GOOGLE
        );
      }
      if (socialLoginType === SocialLoginType.APPLE && userByEmail.socialId) {
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

    const updateData: Partial<IUsers> = {
      location: {
        type: 'Point',
        coordinates: [body?.lng ?? 0, body?.lat ?? 0],
      },
    };

    if (socialId) {
      updateData.socialId = socialId;
    }

    const updatedUser = await UserRepository.updateUserById(
      targetUser._id,
      updateData
    );
    if (!updatedUser) {
      return ApiResponse.notFound(messagesConstants.USER_NOT_REGISTERED);
    }

    const result = await issueAuthTokens(
      updatedUser,
      deviceId,
      deviceType,
      deviceToken
    );

    return ApiResponse.success(result, messagesConstants.LOGIN_SUCCESSFULLY);
  }

  /**
   * Handle user forgot password
   * @param email - user email
   */
  static async forgotPassword(body: SendOtpInput): Promise<ApiResponse> {
    const { email } = body;
    const user = await UserRepository.findByEmail(email);

    if (
      user &&
      user.socialLoginType === SocialLoginType.EMAIL &&
      user.password
    ) {
      const otp = CommonFunctions.generateOtp();
      const otpData: Partial<IOTPMaster> = { email, otp };

      const existingOtp = await OtpRepository.findByEmail(email);
      if (existingOtp) {
        await OtpRepository.deleteOtp(existingOtp._id);
      }

      await OtpRepository.createOtp(otpData);

      const emailContent = forgotPasswordMail({
        name: user.name,
        otp,
      });

      await sendEmail(user.email, 'Forgot Password Mail', emailContent);
    }

    return ApiResponse.success({}, messagesConstants.OTP_SEND);
  }

  /**
   * Handle user reset password (verifies OTP and sets new password)
   */
  static async resetPassword(body: ResetPasswordInput): Promise<ApiResponse> {
    const { email, otp, password } = body;

    const user = await UserRepository.findByEmail(email);
    const otpRecord = await OtpRepository.findByEmail(email);

    if (
      !user ||
      user.socialLoginType !== SocialLoginType.EMAIL ||
      !user.password ||
      !otpRecord ||
      !CommonFunctions.isOtpMatch(otpRecord.otp, otp)
    ) {
      return ApiResponse.badRequest(messagesConstants.INVALID_OTP);
    }

    await OtpRepository.deleteOtp(otpRecord._id);

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
    await UserRepository.updateUserById(user._id, {
      password: hashedPassword,
    });

    await SessionService.revokeAllSessions(user._id);

    return ApiResponse.success(
      {},
      messagesConstants.PASSWORD_RESET_SUCCESSFULLY
    );
  }

  /**
   * Handle refresh token
   * @param body - refresh token input with id
   */
  static async refreshToken(body: RefreshTokenInput): Promise<ApiResponse> {
    const { refreshToken, deviceId, lat, lng } = body;

    try {
      const tokens = await SessionService.refreshAccessToken(
        refreshToken,
        deviceId
      );

      const payload = await JwtUtil.verifyRefreshToken(refreshToken);

      const user = await UserRepository.findById(payload.id);
      if (!user) {
        return ApiResponse.unauthorized(
          messagesConstants.INVALID_REFRESH_TOKEN
        );
      }

      if (lat && lng) {
        await UserRepository.updateUserById(user._id, {
          location: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        });
      }

      return ApiResponse.success(
        tokens,
        messagesConstants.TOKEN_REFRESHED_SUCCESSFULLY
      );
    } catch {
      return ApiResponse.unauthorized(messagesConstants.INVALID_REFRESH_TOKEN);
    }
  }
}
