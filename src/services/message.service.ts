import { FilterQuery } from 'mongoose';

import messagesConstants from '../constants/messages.constants';
import { GetMessagesQuery } from '../interfaces/message.interface';
import { IMessages } from '../models/Messages';
import { IUsers } from '../models/Users';
import MessageRepository from '../repositories/message.repository';
import ApiResponse from '../utils/apiResponse';
import RegexUtil from '../utils/regex.util';

export default class MessageService {
  static async getMessages(
    user: IUsers,
    query: GetMessagesQuery
  ): Promise<ApiResponse> {
    const skip =
      Number.isInteger(Number(query.skip)) && Number(query.skip) >= 0
        ? Number(query.skip)
        : undefined;
    const limit =
      Number.isInteger(Number(query.limit)) && Number(query.limit) > 0
        ? Number(query.limit)
        : undefined;
    const { search } = query;

    const filter: FilterQuery<IMessages> = {
      deletedAt: null,
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    };

    if (search) {
      const escapedSearch = RegexUtil.escapeRegex(search.trim()).slice(0, 100);
      filter.message = { $regex: escapedSearch, $options: 'i' };
    }

    const [messages, total] = await Promise.all([
      MessageRepository.getAllMessages(filter, skip, limit),
      MessageRepository.countAllMessages(filter),
    ]);

    return ApiResponse.success(
      { skip, limit, total, messages },
      messagesConstants.MESSAGES_FETCHED_SUCCESSFULLY
    );
  }
}
