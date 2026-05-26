import { Server as HttpServer } from 'http';
import { DefaultEventsMap, Server as SocketIOServer } from 'socket.io';

import config from '../configs/common.config';
import {
  SocketEmitEvent,
  SocketIoServerEvent,
  SocketListenEvent,
} from '../constants/key.constants';
import messages from '../constants/messages.constants';
import {
  socketAuthMiddleware,
  SocketData,
} from '../middlewares/auth.middleware';
import UserRepository from '../repositories/user.repository';

import ApiResponse from './apiResponse';
import { type SocketAckPayload, toSocketAck } from './socketResponse.util';

// eslint-disable-next-line @typescript-eslint/ban-types
type SocketClientToServerEvents = {};

type SocketServerToClientEvents = {
  [SocketEmitEvent.UNREAD_NOTIFICATION_COUNT]: (
    payload: SocketAckPayload
  ) => void;
  [SocketEmitEvent.SET_ROOM_JOIN]: (payload: SocketAckPayload) => void;
  [SocketEmitEvent.SET_ROOM_LEAVE]: (payload: SocketAckPayload) => void;
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
    console.log(
      `Socket connected: ${socket.id}, (userId: ${socket.data.user?.id})`
    );

    const userId = socket.data.user?.id;
    if (userId) {
      await UserRepository.updateUserById(userId, {
        socketId: socket.id,
      });

      socket.join(userId);
    }

    // room join
    socket.on(SocketListenEvent.ROOM_JOIN, async (otherUserId: string) => {
      const currentUserId = socket.data.user?.id;

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

      const roomId = [currentUserId, otherUserId].sort().join('_');
      socket.join(roomId);

      io?.to(roomId).emit(
        SocketEmitEvent.SET_ROOM_JOIN,
        toSocketAck(
          ApiResponse.success(
            { userId: currentUserId, roomId },
            messages.USER_JOINED_ROOM
          )
        )
      );
    });

    // room leave
    socket.on(SocketListenEvent.ROOM_LEAVE, async (otherUserId: string) => {
      const currentUserId = socket.data.user?.id;

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

      const roomId = [currentUserId, otherUserId].sort().join('_');
      io?.to(roomId).emit(
        SocketEmitEvent.SET_ROOM_LEAVE,
        toSocketAck(
          ApiResponse.success(
            { userId: currentUserId, roomId },
            messages.USER_LEFT_ROOM
          )
        )
      );
      socket.leave(roomId);
    });

    // disconnect
    socket.on(SocketListenEvent.DISCONNECT, async () => {
      console.log(
        `Socket disconnected: ${socket.id}, (userId: ${socket.data.user?.id})`
      );
      const disconnectUser = socket.data.user;
      if (disconnectUser) {
        try {
          await UserRepository.updateUserById(disconnectUser.id, {
            socketId: null,
          });
        } catch {
          console.error(
            `Failed to clear socketId for user ${disconnectUser.id}`
          );
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
