import express from 'express';

import UserController from '../controllers/user.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { profilePictureUpload } from '../middlewares/upload.middleware';
import validateRequest from '../middlewares/validateRequest.middleware';
import userValidations from '../validations/user.validations';

const userRoutes = express.Router();

userRoutes.use(authMiddleware);

userRoutes.get('/profile', UserController.getProfile);

userRoutes.put(
  '/profile',
  profilePictureUpload,
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
