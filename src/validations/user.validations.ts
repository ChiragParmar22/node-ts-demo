import Joi from 'joi';

import { DeviceType, SocialLoginType } from '../constants/key.constants';

const passwordSchema = Joi.string().min(8).max(128).required();

export default {
  sendOtpSchema: {
    body: Joi.object({
      email: Joi.string().trim().email().lowercase().required(),
      name: Joi.string().trim().min(2).max(50).optional(),
      countryCode: Joi.string().trim().optional(),
      phoneNumber: Joi.string().trim().min(7).max(15).optional(),
    }),
  },

  registerUserSchema: {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(50).required(),
      email: Joi.string().trim().email().lowercase().required(),
      countryCode: Joi.string().trim().optional(),
      phoneNumber: Joi.string().trim().min(7).max(15).optional(),
      socialLoginType: Joi.string()
        .valid(...Object.values(SocialLoginType))
        .required(),
      socialId: Joi.string()
        .trim()
        .when('socialLoginType', {
          not: SocialLoginType.EMAIL,
          then: Joi.required(),
          otherwise: Joi.optional().allow(null, ''),
        }),
      password: Joi.string().when('socialLoginType', {
        is: SocialLoginType.EMAIL,
        then: passwordSchema,
        otherwise: Joi.optional().allow(null, ''),
      }),
      otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .when('socialLoginType', {
          is: SocialLoginType.EMAIL,
          then: Joi.required(),
          otherwise: Joi.optional().allow(null, ''),
        }),
      deviceType: Joi.string()
        .valid(DeviceType.iOS, DeviceType.android)
        .required(),
      deviceId: Joi.string().trim().required(),
      deviceToken: Joi.string().trim().optional(),
      lat: Joi.number().min(-90).max(90).allow(0).optional().default(0),
      lng: Joi.number().min(-180).max(180).allow(0).optional().default(0),
    }),
  },

  loginUserSchema: {
    body: Joi.object({
      email: Joi.string().trim().email().lowercase().required(),
      password: passwordSchema,
      deviceType: Joi.string()
        .valid(DeviceType.iOS, DeviceType.android)
        .required(),
      deviceId: Joi.string().trim().required(),
      deviceToken: Joi.string().trim().optional(),
      lat: Joi.number().min(-90).max(90).allow(0).optional().default(0),
      lng: Joi.number().min(-180).max(180).allow(0).optional().default(0),
    }),
  },

  socialLoginSchema: {
    body: Joi.object({
      email: Joi.string()
        .trim()
        .email()
        .lowercase()
        .when('socialLoginType', {
          is: SocialLoginType.APPLE,
          then: Joi.optional().allow(null, ''),
          otherwise: Joi.required(),
        }),
      socialLoginType: Joi.string()
        .valid(SocialLoginType.GOOGLE, SocialLoginType.APPLE)
        .required(),
      socialId: Joi.string()
        .trim()
        .when('socialLoginType', {
          not: SocialLoginType.EMAIL,
          then: Joi.required(),
          otherwise: Joi.optional().allow(null, ''),
        }),
      deviceType: Joi.string()
        .valid(DeviceType.iOS, DeviceType.android)
        .required(),
      deviceId: Joi.string().trim().required(),
      deviceToken: Joi.string().trim().optional(),
      lat: Joi.number().min(-90).max(90).allow(0).optional().default(0),
      lng: Joi.number().min(-180).max(180).allow(0).optional().default(0),
    }),
  },

  resetPasswordSchema: {
    body: Joi.object({
      email: Joi.string().trim().email().lowercase().required(),
      otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required(),
      password: passwordSchema,
    }),
  },

  refreshTokenSchema: {
    body: Joi.object({
      refreshToken: Joi.string().trim().required(),
      deviceId: Joi.string().trim().min(1).max(128).required(),
      lat: Joi.number().min(-90).max(90).allow(0).optional().default(0),
      lng: Joi.number().min(-180).max(180).allow(0).optional().default(0),
    }),
  },

  updateProfileSchema: {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(50).optional(),
      countryCode: Joi.string().trim().allow('', null).optional(),
      phoneNumber: Joi.string().trim().allow('', null).optional(),
      removeProfilePicture: Joi.alternatives()
        .try(Joi.boolean(), Joi.string().valid('true', 'false'))
        .optional(),
      lat: Joi.number().min(-90).max(90).allow(0).optional().default(0),
      lng: Joi.number().min(-180).max(180).allow(0).optional().default(0),
    }),
  },

  changePasswordSchema: {
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: passwordSchema,
    }),
  },

  deleteAccountSchema: {
    body: Joi.object({ deleteReason: Joi.string().trim().min(2).required() }),
  },
};
