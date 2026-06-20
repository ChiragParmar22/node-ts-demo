import express from 'express';

import AuthController from '../controllers/auth.controller';
import { profilePictureUpload } from '../middlewares/upload.middleware';
import validateRequest from '../middlewares/validateRequest.middleware';
import userValidations from '../validations/user.validations';

const authRoutes = express.Router();

authRoutes.post(
  '/sendOtp',
  validateRequest(userValidations.sendOtpSchema),
  AuthController.sendOtp
);

authRoutes.post(
  '/register',
  profilePictureUpload,
  validateRequest(userValidations.registerUserSchema),
  AuthController.register
);

authRoutes.post(
  '/login',
  validateRequest(userValidations.loginUserSchema),
  AuthController.login
);

authRoutes.post(
  '/socialLogin',
  validateRequest(userValidations.socialLoginSchema),
  AuthController.socialLogin
);

authRoutes.post(
  '/forgotPassword',
  validateRequest(userValidations.sendOtpSchema),
  AuthController.forgotPassword
);

authRoutes.post(
  '/resetPassword',
  validateRequest(userValidations.resetPasswordSchema),
  AuthController.resetPassword
);

authRoutes.post(
  '/refreshToken',
  validateRequest(userValidations.refreshTokenSchema),
  AuthController.refreshToken
);

export default authRoutes;
