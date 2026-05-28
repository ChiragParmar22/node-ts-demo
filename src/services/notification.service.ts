import { Types } from 'mongoose';

import {
  NotificationStatus,
  SocketEmitEvent,
} from '../constants/key.constants';
import messagesConstants from '../constants/messages.constants';
import { GetNotificationsQuery } from '../interfaces/notification.interface';
import { IUsers } from '../models/Users';
import NotificationRepository from '../repositories/notification.repository';
// import UserRepository from '../repositories/user.repository';
import ApiResponse from '../utils/apiResponse';
// import sendFirebaseNotification from '../utils/pushNotification';
import { emitSocketToUser } from '../utils/socket';

const DEFAULT_SKIP = 0;
const DEFAULT_LIMIT = 10;

export default class NotificationService {
  static async getNotifications(
    user: IUsers,
    query: GetNotificationsQuery
  ): Promise<ApiResponse> {
    const skip =
      Number.isInteger(Number(query.skip)) && Number(query.skip) >= 0
        ? Number(query.skip)
        : DEFAULT_SKIP;
    const limit =
      Number.isInteger(Number(query.limit)) && Number(query.limit) > 0
        ? Number(query.limit)
        : DEFAULT_LIMIT;

    await NotificationRepository.readNotificationsByUserId(user._id);

    const [notifications, total] = await Promise.all([
      NotificationRepository.getNotificationsByUserId(user._id, skip, limit),
      NotificationRepository.countNotificationsByUserId(user._id),
    ]);

    return ApiResponse.success(
      { notifications, skip, limit, total },
      messagesConstants.NOTIFICATIONS_FETCHED_SUCCESSFULLY
    );
  }

  static async createNotification(payload: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    status?: NotificationStatus;
  }): Promise<void> {
    const { userId } = payload;

    await NotificationRepository.create({
      ...payload,
      userId: new Types.ObjectId(userId),
    });

    // const user = await UserRepository.findById(userId);
    // const deviceToken = user?.deviceToken;

    // if (deviceToken)
    //   await sendFirebaseNotification(deviceToken, title, message, {
    //     ...data,
    //     type,
    //     notificationId: createdNotification._id,
    //   });
  }

  static async emitUnreadNotificationCount(userId: string): Promise<void> {
    const unreadCount =
      await NotificationRepository.countUnreadByUserId(userId);
    emitSocketToUser(
      userId,
      SocketEmitEvent.UNREAD_NOTIFICATION_COUNT,
      ApiResponse.success(
        { unreadCount },
        messagesConstants.UNREAD_NOTIFICATION_COUNT_FETCHED_SUCCESSFULLY
      )
    );
  }
}
