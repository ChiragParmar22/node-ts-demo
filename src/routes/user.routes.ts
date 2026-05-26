import express, { Request } from 'express';
import fs from 'fs';
import multer, { FileFilterCallback } from 'multer';

import UserController from '../controllers/user.controller';
import authMiddleware from '../middlewares/auth.middleware';
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

const userRoutes = express.Router();

userRoutes.use(authMiddleware);

userRoutes.get('/profile', UserController.getProfile);

userRoutes.put(
  '/profile',
  upload.single('profilePicture'),
  validateRequest(userValidations.updateProfileSchema),
  UserController.updateProfile
);

userRoutes.post(
  '/changePassword',
  validateRequest(userValidations.changePasswordSchema),
  UserController.changePassword
);

userRoutes.post('/logout', UserController.logout);
userRoutes.delete(
  '/deleteAccount',
  validateRequest(userValidations.deleteAccountSchema),
  UserController.deleteAccount
);

export default userRoutes;
