import { NextFunction, Request, Response } from 'express';

import { Users } from '../database/entities/Users';
import { GetNotificationsQuery } from '../interfaces/notification.interface';
import NotificationService from '../services/notification.service';

export default class NotificationController {
  static async getNotifications(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await NotificationService.getNotifications(
        request.user as Users,
        request.query as unknown as GetNotificationsQuery
      );
      return response.status(result.statusCode).json(result);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
