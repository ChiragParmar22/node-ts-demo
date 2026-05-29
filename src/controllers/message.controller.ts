import { NextFunction, Request, Response } from 'express';
import fs from 'fs';

import config from '../configs/common.config';
import { ChatType } from '../constants/key.constants';
import messagesConstants from '../constants/messages.constants';
import { GetMessagesQuery } from '../interfaces/message.interface';
import { IUsers } from '../models/Users';
import MessageService from '../services/message.service';
import ApiResponse from '../utils/apiResponse';

export default class MessageController {
  /**
   * Handle uploading files (images, audio, video, files)
   */
  static async uploadFile(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      if (!request.file) {
        const result = ApiResponse.badRequest(
          messagesConstants.NO_FILE_UPLOADED
        );
        return response.status(result.statusCode).json(result);
      }

      const fileMime = request.file.mimetype;
      const chatType = request.body.chatType;

      // Check mime type and chatType match
      let isMimeMatched = false;
      if (chatType === ChatType.IMAGE) {
        isMimeMatched = fileMime.startsWith('image/');
      } else if (chatType === ChatType.VIDEO) {
        isMimeMatched = fileMime.startsWith('video/');
      } else if (chatType === ChatType.AUDIO) {
        isMimeMatched = fileMime.startsWith('audio/');
      } else if (chatType === ChatType.FILE) {
        isMimeMatched = true;
      }

      if (!isMimeMatched) {
        fs.unlinkSync(request.file.path);
        const result = ApiResponse.badRequest(
          messagesConstants.FILE_TYPE_MISMATCH(fileMime, chatType)
        );
        return response.status(result.statusCode).json(result);
      }

      const fileName = request.file.filename;
      const serverUrlWIthoutPort = config.SERVER_URL.replace(
        `:${config.PORT}`,
        ''
      );
      const fileUrl = `${serverUrlWIthoutPort}/public/chatFiles/${fileName}`;

      // Return the saved file name as requested
      const result = ApiResponse.created(
        { fileName, fileUrl },
        messagesConstants.FILE_UPLOADED_SUCCESSFULLY
      );

      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      if (
        request.file &&
        request.file.path &&
        fs.existsSync(request.file.path)
      ) {
        try {
          fs.unlinkSync(request.file.path);
        } catch (unlinkErr) {
          console.error('Failed to delete file on error cleanup:', unlinkErr);
        }
      }
      return next(error);
    }
  }

  /**
   * Get all messages with skip, limit, and search functionality
   */
  static async getMessages(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await MessageService.getMessages(
        request.user as IUsers,
        request.query as unknown as GetMessagesQuery
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
