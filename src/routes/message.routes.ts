import express from 'express';

import MessageController from '../controllers/message.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { chatFileUpload } from '../middlewares/upload.middleware';
import validateRequest from '../middlewares/validateRequest.middleware';
import messageValidations from '../validations/message.validations';

const messageRoutes = express.Router();

messageRoutes.use(authMiddleware);

messageRoutes.post(
  '/upload',
  validateRequest(messageValidations.uploadSchema),
  chatFileUpload,
  MessageController.uploadFile
);

messageRoutes.get(
  '/',
  validateRequest(messageValidations.getMessagesSchema),
  MessageController.getMessages
);

export default messageRoutes;
