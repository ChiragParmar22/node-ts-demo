import express, { Request } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

import MessageController from '../controllers/message.controller';
import authMiddleware from '../middlewares/auth.middleware';
import validateRequest from '../middlewares/validateRequest.middleware';
import messageValidations from '../validations/message.validations';

const multerStorage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadPath = 'src/public/chatFiles';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `file_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

const messageRoutes = express.Router();

messageRoutes.use(authMiddleware);

messageRoutes.post(
  '/upload',
  upload.single('file'),
  validateRequest(messageValidations.uploadSchema),
  MessageController.uploadFile
);

messageRoutes.get(
  '/',
  validateRequest(messageValidations.getMessagesSchema),
  MessageController.getMessages
);

export default messageRoutes;
