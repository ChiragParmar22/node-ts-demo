import fs from 'fs';
import path from 'path';

import { SocialLoginType } from '../constants/key.constants';
import messagesConstants from '../constants/messages.constants';
import {
  ChangePasswordInput,
  DeleteAccountInput,
  UpdateProfileInput,
} from '../interfaces/user.interface';
import { IUsers } from '../models/Users';
import UserRepository from '../repositories/user.repository';
import ApiResponse from '../utils/apiResponse';
import BcryptjsUtil from '../utils/bcryptjs.util';
import CommonFunctions from '../utils/commonFunctions';

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

const removeProfilePictureFile = (filename?: string | null): void => {
  if (!filename) return;

  const imagePath = path.join(
    __dirname,
    'src/public/profilePictures',
    filename
  );
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
};

export default class UserService {
  /**
   * Get current user profile
   */
  static async getProfile(user: IUsers): Promise<ApiResponse> {
    return ApiResponse.success(
      sanitizeUser(user),
      messagesConstants.PROFILE_FETCHED_SUCCESSFULLY
    );
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    user: IUsers,
    body: UpdateProfileInput,
    file?: Express.Multer.File
  ): Promise<ApiResponse> {
    const updateData: Partial<IUsers> = {
      name: body.name || user.name,
      countryCode: body.countryCode || user.countryCode,
      phoneNumber: body.phoneNumber || user.phoneNumber,
    };

    const shouldRemovePicture =
      body.removeProfilePicture === true ||
      body.removeProfilePicture === 'true';

    if (shouldRemovePicture) {
      removeProfilePictureFile(user.profilePicture);
      updateData.profilePicture = null;
    } else if (file?.filename) {
      removeProfilePictureFile(user.profilePicture);
      updateData.profilePicture = file.filename;
    }

    const updatedUser = await UserRepository.updateUserById(
      user._id,
      updateData
    );
    if (!updatedUser) {
      return ApiResponse.notFound(messagesConstants.USER_NOT_FOUND);
    }

    return ApiResponse.success(
      sanitizeUser(updatedUser),
      messagesConstants.PROFILE_UPDATED_SUCCESSFULLY
    );
  }

  /**
   * Change user password
   */
  static async changePassword(
    user: IUsers,
    body: ChangePasswordInput
  ): Promise<ApiResponse> {
    if (user.socialLoginType !== SocialLoginType.EMAIL || !user.password) {
      return ApiResponse.badRequest(
        messagesConstants.USER_REGISTERED_WITH_SOCIAL_LOGIN_CHANGE_PASSWORD
      );
    }

    const isCurrentPasswordCorrect = await BcryptjsUtil.comparePassword(
      body.currentPassword,
      user.password
    );
    if (!isCurrentPasswordCorrect) {
      return ApiResponse.badRequest(
        messagesConstants.CURRENT_PASSWORD_INCORRECT
      );
    }

    const isPasswordSame = await BcryptjsUtil.comparePassword(
      body.newPassword,
      user.password
    );
    if (isPasswordSame) {
      return ApiResponse.badRequest(messagesConstants.PASSWORD_ALREADY_USED);
    }

    const hashedPassword = await BcryptjsUtil.hashPassword(body.newPassword);
    await UserRepository.updateUserById(user._id, { password: hashedPassword });

    return ApiResponse.success(
      {},
      messagesConstants.PASSWORD_CHANGED_SUCCESSFULLY
    );
  }

  /**
   * Logout user
   */
  static async logout(sessionId: string): Promise<ApiResponse> {
    await SessionService.revokeSession(sessionId);

    return ApiResponse.success({}, messagesConstants.LOGOUT_SUCCESSFULLY);
  }

  /**
   * Delete account (soft delete)
   */
  static async deleteAccount(
    user: IUsers,
    body: DeleteAccountInput
  ): Promise<ApiResponse> {
    await SessionService.revokeAllSessions(user._id.toString());

    await UserRepository.updateUserById(user._id, {
      deletedAt: new Date(),
      deleteReason: body.deleteReason,
      socketId: null,
    });

    return ApiResponse.success(
      {},
      messagesConstants.ACCOUNT_DELETED_SUCCESSFULLY
    );
  }
}
