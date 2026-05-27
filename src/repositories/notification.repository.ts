import { FilterQuery, Types, UpdateWriteOpResult } from 'mongoose';

import { NotificationStatus } from '../constants/key.constants';
import { INotification, Notification } from '../models/Notification';

export default class NotificationRepository {
  static async create(data: Partial<INotification>): Promise<INotification> {
    return await Notification.create(data);
  }

  static async getNotificationsByUserId(
    userId: string | Types.ObjectId,
    skip: number,
    limit: number
  ): Promise<INotification[]> {
    return await Notification.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  static async countNotificationsByUserId(
    userId: string | Types.ObjectId
  ): Promise<number> {
    return await Notification.countDocuments({ userId, deletedAt: null });
  }

  static async countUnreadByUserId(
    userId: string | Types.ObjectId
  ): Promise<number> {
    return await Notification.countDocuments({
      userId,
      readAt: null,
      deletedAt: null,
    });
  }

  static async updateNotificationStatus(
    id: string | Types.ObjectId,
    status: NotificationStatus
  ): Promise<UpdateWriteOpResult> {
    return await Notification.updateOne({ _id: id }, { status });
  }

  static async readNotificationsByUserId(
    userId: string | Types.ObjectId
  ): Promise<UpdateWriteOpResult> {
    return await Notification.updateMany(
      { userId, readAt: null, deletedAt: null },
      { readAt: new Date() }
    );
  }

  static async findNotification(
    filters: FilterQuery<INotification>
  ): Promise<INotification | null> {
    return await Notification.findOne(filters);
  }
}
