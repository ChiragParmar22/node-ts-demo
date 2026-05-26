import express, { Request } from 'express';
import fs from 'fs';
import multer, { FileFilterCallback } from 'multer';

import AuthController from '../controllers/auth.controller';
import validateRequest from '../middlewares/validateRequest.middleware';
import userValidations from '../validations/user.validations';

const multerStorage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadPath = 'src/public/profilePictures';
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `img_${Date.now()}.${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG files are allowed'));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const authRoutes = express.Router();

authRoutes.post(
  '/sendOtp',
  validateRequest(userValidations.sendOtpSchema),
  AuthController.sendOtp
);

authRoutes.post(
  '/register',
  upload.single('profilePicture'),
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
  '/verifyOtp',
  validateRequest(userValidations.verifyOtpSchema),
  AuthController.verifyOtp
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
