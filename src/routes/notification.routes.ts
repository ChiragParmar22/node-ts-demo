import { Router } from 'express';

import NotificationController from '../controllers/notification.controller';
import authMiddleware from '../middlewares/auth.middleware';
import validateRequest from '../middlewares/validateRequest.middleware';
import notificationValidations from '../validations/notification.validations';

const notificationRoutes = Router();

notificationRoutes.use(authMiddleware);

notificationRoutes.get(
  '/',
  validateRequest(notificationValidations.getNotificationsSchema),
  NotificationController.getNotifications
);

export default notificationRoutes;
