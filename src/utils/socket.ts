import { Server as HttpServer } from 'http';
import { Types } from 'mongoose';
import { DefaultEventsMap, Server as SocketIOServer } from 'socket.io';

import config from '../configs/common.config';
import {
  ChatType,
  SocketEmitEvent,
  SocketIoServerEvent,
  SocketListenEvent,
} from '../constants/key.constants';
import messages from '../constants/messages.constants';
import {
  socketAuthMiddleware,
  SocketData,
} from '../middlewares/auth.middleware';
import MessageRepository from '../repositories/message.repository';
import UserRepository from '../repositories/user.repository';
import messageValidations from '../validations/message.validations';

import ApiResponse from './apiResponse';
import { type SocketAckPayload, toSocketAck } from './socketResponse.util';

type SocketClientToServerEvents = {
  [SocketListenEvent.ROOM_JOIN]: (otherUserId: string) => void;
  [SocketListenEvent.ROOM_LEAVE]: (otherUserId: string) => void;
  [SocketListenEvent.SEND_MESSAGE]: (
    receiverId: string,
    chatType: ChatType,
    message: string
  ) => void;
  [SocketListenEvent.UPDATE_MESSAGE]: (
    messageId: string,
    message: string
  ) => void;
  [SocketListenEvent.DELETE_MESSAGE]: (messageId: string) => void;
  [SocketListenEvent.DISCONNECT]: () => void;
};

type SocketServerToClientEvents = {
  [SocketEmitEvent.UNREAD_NOTIFICATION_COUNT]: (
    payload: SocketAckPayload
  ) => void;
  [SocketEmitEvent.SET_ROOM_JOIN]: (payload: SocketAckPayload) => void;
  [SocketEmitEvent.SET_ROOM_LEAVE]: (payload: SocketAckPayload) => void;
  [SocketEmitEvent.SET_SEND_MESSAGE]: (payload: SocketAckPayload) => void;
  [SocketEmitEvent.SET_UPDATE_MESSAGE]: (payload: SocketAckPayload) => void;
  [SocketEmitEvent.SET_DELETE_MESSAGE]: (payload: SocketAckPayload) => void;
  [SocketEmitEvent.SET_MESSAGE_LIST]: (payload: SocketAckPayload) => void;
};

let io: SocketIOServer<
  SocketClientToServerEvents,
  SocketServerToClientEvents,
  DefaultEventsMap,
  SocketData
> | null = null;

export const initializeSocket = (
  server: HttpServer
): SocketIOServer<
  SocketClientToServerEvents,
  SocketServerToClientEvents,
  DefaultEventsMap,
  SocketData
> => {
  io = new SocketIOServer<
    SocketClientToServerEvents,
    SocketServerToClientEvents,
    DefaultEventsMap,
    SocketData
  >(server, {
    cors: {
      origin: [config.SERVER_URL, config.CLIENT_URL],
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  // connection
  io.on(SocketIoServerEvent.CONNECTION, async (socket) => {
    const userId = socket.data.user?._id?.toString();

    console.log(`Socket connected: ${socket.id}, (userId: ${userId})`);

    if (userId) {
      await UserRepository.updateUserById(userId, {
        socketId: socket.id,
      });

      socket.join(userId);
    }

    // room join
    socket.on(SocketListenEvent.ROOM_JOIN, async (otherUserId: string) => {
      if (!otherUserId || typeof otherUserId !== 'string') {
        socket.emit(
          SocketEmitEvent.SET_ROOM_JOIN,
          toSocketAck(ApiResponse.badRequest(messages.INVALID_USER_ID))
        );
        return;
      }

      const otherUser = await UserRepository.findById(otherUserId);
      if (!otherUser) {
        socket.emit(
          SocketEmitEvent.SET_ROOM_JOIN,
          toSocketAck(ApiResponse.notFound(messages.ROOM_USER_NOT_FOUND))
        );
        return;
      }

      const roomId = [userId, otherUserId].sort().join('_');
      socket.join(roomId);

      io?.to(roomId).emit(
        SocketEmitEvent.SET_ROOM_JOIN,
        toSocketAck(
          ApiResponse.success({ userId, roomId }, messages.USER_JOINED_ROOM)
        )
      );
    });

    // room leave
    socket.on(SocketListenEvent.ROOM_LEAVE, async (otherUserId: string) => {
      if (!otherUserId || typeof otherUserId !== 'string') {
        socket.emit(
          SocketEmitEvent.SET_ROOM_LEAVE,
          toSocketAck(ApiResponse.badRequest(messages.INVALID_USER_ID))
        );
        return;
      }

      const otherUser = await UserRepository.findById(otherUserId);
      if (!otherUser) {
        socket.emit(
          SocketEmitEvent.SET_ROOM_LEAVE,
          toSocketAck(ApiResponse.notFound(messages.ROOM_USER_NOT_FOUND))
        );
        return;
      }

      const roomId = [userId, otherUserId].sort().join('_');
      io?.to(roomId).emit(
        SocketEmitEvent.SET_ROOM_LEAVE,
        toSocketAck(
          ApiResponse.success({ userId, roomId }, messages.USER_LEFT_ROOM)
        )
      );
      socket.leave(roomId);
    });

    // send message
    socket.on(
      SocketListenEvent.SEND_MESSAGE,
      async (receiverId: string, chatType: ChatType, message: string) => {
        if (!userId) {
          socket.emit(
            SocketEmitEvent.SET_SEND_MESSAGE,
            toSocketAck(ApiResponse.unauthorized(messages.UNAUTHORIZED))
          );
          return;
        }

        // 1. Validate payload using Joi Schema
        const { error } = messageValidations.sendMessageSchema.validate({
          receiverId,
          chatType,
          message,
        });

        if (error) {
          socket.emit(
            SocketEmitEvent.SET_SEND_MESSAGE,
            toSocketAck(
              ApiResponse.badRequest(
                error.details?.[0]?.message || error.message
              )
            )
          );
          return;
        }

        try {
          // 2. Validate receiver exists in DB
          const receiver = await UserRepository.findById(receiverId);
          if (!receiver) {
            socket.emit(
              SocketEmitEvent.SET_SEND_MESSAGE,
              toSocketAck(ApiResponse.notFound(messages.RECEIVER_NOT_FOUND))
            );
            return;
          }

          // 3. Determine/validate room
          const roomId = [userId, receiverId].sort().join('_');

          // 4. Create and save the message
          const newMessage = await MessageRepository.createMessage({
            roomId,
            senderId: new Types.ObjectId(userId),
            receiverId: new Types.ObjectId(receiverId),
            chatType,
            message: message.trim(),
          });

          const response = ApiResponse.success(newMessage, messages.CREATED);

          // Broadcast to both users in the room
          io?.to(roomId).emit(
            SocketEmitEvent.SET_SEND_MESSAGE,
            toSocketAck(response)
          );
        } catch (error) {
          console.error('Error in sendMessage socket event:', error);
          socket.emit(
            SocketEmitEvent.SET_SEND_MESSAGE,
            toSocketAck(
              ApiResponse.internalError(messages.INTERNAL_SERVER_ERROR)
            )
          );
        }
      }
    );

    // update message
    socket.on(
      SocketListenEvent.UPDATE_MESSAGE,
      async (messageId: string, message: string) => {
        if (!userId) {
          socket.emit(
            SocketEmitEvent.SET_UPDATE_MESSAGE,
            toSocketAck(ApiResponse.unauthorized(messages.UNAUTHORIZED))
          );
          return;
        }

        // 1. Validate payload using Joi Schema
        const { error } = messageValidations.updateMessageSchema.validate({
          messageId,
          message,
        });

        if (error) {
          socket.emit(
            SocketEmitEvent.SET_UPDATE_MESSAGE,
            toSocketAck(
              ApiResponse.badRequest(
                error.details?.[0]?.message || error.message
              )
            )
          );
          return;
        }

        try {
          const existingMessage =
            await MessageRepository.getMessageById(messageId);
          if (!existingMessage) {
            socket.emit(
              SocketEmitEvent.SET_UPDATE_MESSAGE,
              toSocketAck(ApiResponse.notFound(messages.NOT_FOUND))
            );
            return;
          }

          // 2. Only the sender can update their message
          if (existingMessage.senderId.toString() !== userId) {
            socket.emit(
              SocketEmitEvent.SET_UPDATE_MESSAGE,
              toSocketAck(ApiResponse.forbidden(messages.FORBIDDEN))
            );
            return;
          }

          // 3. User can only edit text messages (chatType === ChatType.TEXT)
          if (existingMessage.chatType !== ChatType.TEXT) {
            socket.emit(
              SocketEmitEvent.SET_UPDATE_MESSAGE,
              toSocketAck(
                ApiResponse.badRequest(messages.ONLY_TEXT_EDIT_ALLOWED)
              )
            );
            return;
          }

          const updatedMessage = await MessageRepository.updateMessageById(
            messageId,
            { message: message.trim() }
          );

          const response = ApiResponse.success(
            updatedMessage,
            messages.SUCCESS
          );

          // Emit update to the entire room so both users see the update
          io?.to(existingMessage.roomId).emit(
            SocketEmitEvent.SET_UPDATE_MESSAGE,
            toSocketAck(response)
          );
        } catch (error) {
          console.error('Error in updateMessage socket event:', error);
          socket.emit(
            SocketEmitEvent.SET_UPDATE_MESSAGE,
            toSocketAck(
              ApiResponse.internalError(messages.INTERNAL_SERVER_ERROR)
            )
          );
        }
      }
    );

    // delete message
    socket.on(SocketListenEvent.DELETE_MESSAGE, async (messageId: string) => {
      if (!userId) {
        socket.emit(
          SocketEmitEvent.SET_DELETE_MESSAGE,
          toSocketAck(ApiResponse.unauthorized(messages.UNAUTHORIZED))
        );
        return;
      }

      // 1. Validate payload using Joi Schema
      const { error } = messageValidations.deleteMessageSchema.validate({
        messageId,
      });

      if (error) {
        socket.emit(
          SocketEmitEvent.SET_DELETE_MESSAGE,
          toSocketAck(
            ApiResponse.badRequest(error.details?.[0]?.message || error.message)
          )
        );
        return;
      }

      try {
        const existingMessage =
          await MessageRepository.getMessageById(messageId);
        if (!existingMessage) {
          socket.emit(
            SocketEmitEvent.SET_DELETE_MESSAGE,
            toSocketAck(ApiResponse.notFound(messages.NOT_FOUND))
          );
          return;
        }

        // 2. Only the sender can delete their message
        if (existingMessage.senderId.toString() !== userId) {
          socket.emit(
            SocketEmitEvent.SET_DELETE_MESSAGE,
            toSocketAck(ApiResponse.forbidden(messages.FORBIDDEN))
          );
          return;
        }

        const deletedMessage =
          await MessageRepository.deleteMessageById(messageId);

        const response = ApiResponse.success(deletedMessage, messages.SUCCESS);

        // Emit delete event to the entire room
        io?.to(existingMessage.roomId).emit(
          SocketEmitEvent.SET_DELETE_MESSAGE,
          toSocketAck(response)
        );
      } catch (error) {
        console.error('Error in deleteMessage socket event:', error);
        socket.emit(
          SocketEmitEvent.SET_DELETE_MESSAGE,
          toSocketAck(ApiResponse.internalError(messages.INTERNAL_SERVER_ERROR))
        );
      }
    });

    // disconnect
    socket.on(SocketListenEvent.DISCONNECT, async () => {
      console.log(`Socket disconnected: ${socket.id}, (userId: ${userId})`);

      if (userId) {
        try {
          await UserRepository.updateUserById(userId, {
            socketId: null,
          });
        } catch {
          console.error(`Failed to clear socketId for user ${userId}`);
        }
      }
    });
  });

  return io;
};

export const emitSocketToUser = (
  roomId: string,
  event: keyof SocketServerToClientEvents,
  apiResponse: ApiResponse
): void => {
  if (!io) {
    return;
  }

  io.to(roomId).emit(event, toSocketAck(apiResponse));
};
