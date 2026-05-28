import { FilterQuery, Types, UpdateWriteOpResult } from 'mongoose';

import { IMessages, Messages } from '../models/Messages';

export default class MessageRepository {
  static async createMessage(data: Partial<IMessages>): Promise<IMessages> {
    return await Messages.create(data);
  }

  static async updateMessageById(
    id: string | Types.ObjectId,
    data: Partial<IMessages>
  ): Promise<IMessages | null> {
    return await Messages.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }

  static async getMessageById(
    id: string | Types.ObjectId
  ): Promise<IMessages | null> {
    return await Messages.findOne({ _id: id, deletedAt: null });
  }

  static async getMessagesByRoomId(
    roomId: string,
    skip: number,
    limit: number
  ): Promise<IMessages[]> {
    return await Messages.find({ roomId, deletedAt: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  static async countMessagesByRoomId(roomId: string): Promise<number> {
    return await Messages.countDocuments({ roomId, deletedAt: null });
  }

  static async markMessagesAsSeen(
    roomId: string,
    receiverId: string | Types.ObjectId
  ): Promise<UpdateWriteOpResult> {
    return await Messages.updateMany(
      { roomId, receiverId, isSeen: false, deletedAt: null },
      { isSeen: true, updatedAt: new Date() }
    );
  }

  static async deleteMessageById(
    id: string | Types.ObjectId
  ): Promise<IMessages | null> {
    return await Messages.findByIdAndUpdate(
      id,
      { deletedAt: new Date(), updatedAt: new Date() },
      { new: true }
    );
  }

  static async findMessage(
    filters: FilterQuery<IMessages>
  ): Promise<IMessages | null> {
    return await Messages.findOne({ ...filters, deletedAt: null });
  }
}
