import Joi from 'joi';

import { DeviceType, SocialLoginType } from '../constants/key.constants';
const uuidValidator = Joi.string().uuid();

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
      password: Joi.string().when('socialLoginType', {
        is: SocialLoginType.EMAIL,
        then: Joi.required(),
        otherwise: Joi.optional().allow(null, ''),
      }),
      otp: Joi.string()
        .length(4)
        .when('socialLoginType', {
          is: SocialLoginType.EMAIL,
          then: Joi.required(),
          otherwise: Joi.optional().allow(null, ''),
        }),
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
      deviceToken: Joi.string().trim().optional(),
      lat: Joi.number().min(-90).max(90).allow(0).optional().default(0),
      lng: Joi.number().min(-180).max(180).allow(0).optional().default(0),
    }),
  },

  loginUserSchema: {
    body: Joi.object({
      email: Joi.string().trim().email().lowercase().required(),
      password: Joi.string().min(8).required(),
      deviceType: Joi.string()
        .valid(DeviceType.iOS, DeviceType.android)
        .required(),
      deviceToken: Joi.string().trim().optional(),
      lat: Joi.number().min(-90).max(90).allow(0).optional().default(0),
      lng: Joi.number().min(-180).max(180).allow(0).optional().default(0),
    }),
  },

  verifyOtpSchema: {
    body: Joi.object({
      email: Joi.string().trim().email().lowercase().required(),
      otp: Joi.string().length(4).required(),
    }),
  },

  resetPasswordSchema: {
    body: Joi.object({
      id: uuidValidator.required(),
      password: Joi.string().required(),
    }),
  },

  refreshTokenSchema: {
    body: Joi.object({
      userId: uuidValidator.required(),
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
      newPassword: Joi.string().required(),
    }),
  },

  deleteAccountSchema: {
    body: Joi.object({ deleteReason: Joi.string().trim().min(2).required() }),
  },

  socialLoginSchema: {
    body: Joi.object({
      email: Joi.string().trim().email().lowercase().required(),
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
      deviceToken: Joi.string().trim().optional(),
      lat: Joi.number().min(-90).max(90).allow(0).optional().default(0),
      lng: Joi.number().min(-180).max(180).allow(0).optional().default(0),
    }),
  },
};
