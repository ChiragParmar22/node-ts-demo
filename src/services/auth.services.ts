import messagesConstants from '../constants/messages.constants';
import { OTPMaster } from '../database/entities/OTPMaster';
import { Users } from '../database/entities/Users';
import {
  RefreshTokenInput,
  ResetPasswordInput,
  SendOtpInput,
  SigninInput,
  SignupInput,
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
   * Send OTP to email for signup
   * @param body - send otp input with email
   */
  static async sendOtp(body: SendOtpInput): Promise<ApiResponse> {
    const { email, name } = body;

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
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
   * Register new user (signup)
   * @param body - user signup credentials
   * @param file - uploaded profile picture
   */
  static async signup(
    body: SignupInput,
    file?: Express.Multer.File
  ): Promise<ApiResponse> {
    const existingUser = await UserRepository.findByEmail(body.email);
    if (existingUser) {
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

    const otp = await OtpRepository.findByEmail(body.email);
    if (!otp) {
      return ApiResponse.badRequest(messagesConstants.OTP_EXPIRED);
    }

    if (otp.otp !== body.otp) {
      return ApiResponse.badRequest(messagesConstants.INVALID_OTP);
    }

    await OtpRepository.deleteOtp(otp.id);

    const hashedPassword = await BcryptjsUtil.hashPassword(body.password);

    const userData = {
      name: body.name,
      email: body.email,
      countryCode: body?.countryCode,
      phoneNumber: body?.phoneNumber,
      password: hashedPassword,
      profilePicture: file?.filename,
      deviceType: body?.deviceType,
      deviceToken: body?.deviceToken,
      lat: String(body?.lat),
      lng: String(body?.lng),
    };

    const newUser = await UserRepository.createUser(userData);
    const token = JwtUtil.generateToken({ id: newUser.id });

    const result = { ...sanitizeUser(newUser), token };

    return ApiResponse.created(result, messagesConstants.ACCOUNT_CREATED);
  }

  /**
   * Sign in user
   * @param body - user signin credentials
   */
  static async signin(body: SigninInput): Promise<ApiResponse> {
    const { email, password, deviceType, deviceToken } = body;
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return ApiResponse.notFound(messagesConstants.USER_NOT_REGISTERED);
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

    return ApiResponse.success(result, messagesConstants.SIGNIN_SUCCESSFULLY);
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

    const isPasswordSame = await BcryptjsUtil.comparePassword(
      password,
      user.password
    );
    if (isPasswordSame) {
      return ApiResponse.badRequest(messagesConstants.PASSWORD_ALREADY_USED);
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
