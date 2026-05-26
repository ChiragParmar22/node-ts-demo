import { FindOptionsWhere, IsNull } from 'typeorm';

import { NotificationStatus } from '../constants/key.constants';
import { AppDataSource } from '../database/dbConnection';
import { Notification } from '../database/entities/Notification';

export default class NotificationRepository {
  private static get repository() {
    return AppDataSource.getRepository(Notification);
  }

  static async create(data: Partial<Notification>): Promise<Notification> {
    const row = this.repository.create(data);
    return await this.repository.save(row);
  }

  static async getNotificationsByUserId(
    userId: string,
    skip: number,
    limit: number
  ): Promise<Notification[]> {
    return await this.repository.find({
      where: { userId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
  }

  static async countNotificationsByUserId(userId: string): Promise<number> {
    return await this.repository.count({
      where: { userId, deletedAt: IsNull() },
    });
  }

  static async countUnreadByUserId(userId: string): Promise<number> {
    return await this.repository.count({
      where: { userId, readAt: IsNull(), deletedAt: IsNull() },
    });
  }

  static async updateNotificationStatus(
    id: string,
    status: NotificationStatus
  ): Promise<void> {
    await this.repository.update({ id }, { status });
  }

  static async readNotificationsByUserId(userId: string): Promise<void> {
    await this.repository.update(
      { userId, readAt: IsNull(), deletedAt: IsNull() },
      { readAt: new Date() }
    );
  }

  static async findNotification(
    filters: FindOptionsWhere<Notification>
  ): Promise<Notification | null> {
    return await this.repository.findOne({ where: filters });
  }
}
