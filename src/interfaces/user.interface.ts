import { DeviceType } from '../constants/key.constants';

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
 * User signup input interface
 */
export interface SignupInput {
  name: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string;
  password: string;
  otp: string;
  deviceType?: DeviceType.iOS | DeviceType.android | null;
  deviceToken?: string | null;
  lat?: number;
  lng?: number;
}

/**
 * User signin input interface
 */
export interface SigninInput {
  email: string;
  password: string;
  deviceType?: DeviceType.iOS | DeviceType.android | null;
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
