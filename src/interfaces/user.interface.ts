import { DeviceType, SocialLoginType } from '../constants/key.constants';

/**
 * Send OTP input interface
 */
export interface SendOtpInput {
  email: string;
  name?: string;
  countryCode?: string;
  phoneNumber?: string;
}

/**
 * User register input interface
 */
export interface RegisterInput {
  name: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string;
  socialLoginType?: SocialLoginType;
  password?: string;
  otp?: string;
  socialId?: string | null;
  deviceType: DeviceType.iOS | DeviceType.android;
  deviceToken?: string | null;
  lat?: number;
  lng?: number;
}

/**
 * User login input interface
 */
export interface LoginInput {
  email: string;
  password: string;
  deviceType?: DeviceType.iOS | DeviceType.android | null;
  deviceToken?: string | null;
  lat?: number;
  lng?: number;
}

/**
 * Social login input interface
 */
export interface SocialLoginInput {
  email: string;
  socialLoginType: SocialLoginType;
  socialId?: string | null;
  deviceType: DeviceType.iOS | DeviceType.android;
  deviceToken?: string | null;
  lat?: number;
  lng?: number;
}

/**
 * Verify OTP input interface
 */
export interface VerifyOtpInput {
  email: string;
  otp: string;
}

/**
 * Reset password input interface
 */
export interface ResetPasswordInput {
  id: string;
  password: string;
}

/**
 * Refresh token input interface
 */
export interface RefreshTokenInput {
  userId: string;
  lat?: number;
  lng?: number;
}

export interface UpdateProfileInput {
  name?: string;
  countryCode?: string;
  phoneNumber?: string;
  removeProfilePicture?: boolean | 'true' | 'false';
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountInput {
  deleteReason: string;
}

/**
 * JWT payload interface
 */
export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}
