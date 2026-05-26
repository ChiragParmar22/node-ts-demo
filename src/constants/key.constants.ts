export enum DeviceType {
  iOS = 'iOS',
  android = 'android',
}

export enum SocialLoginType {
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
}

export enum NotificationType {}

export enum NotificationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

/**
 * Socket.IO: use with `io.on(...)` on the server instance.
 */
export enum SocketIoServerEvent {
  CONNECTION = 'connection',
}

/**
 * Socket.IO: use with `socket.on(...)` (server listens — client emits or lifecycle).
 */
export enum SocketListenEvent {
  DISCONNECT = 'disconnect',
  ROOM_JOIN = 'roomJoin',
  ROOM_LEAVE = 'roomLeave',
}

/**
 * Socket.IO: server -> client (`socket.emit` / `io.to.emit`).
 * Add keys when you introduce push-style events.
 */
export const SocketEmitEvent = {
  UNREAD_NOTIFICATION_COUNT: 'unreadNotificationCount',
  SET_ROOM_JOIN: 'setRoomJoin',
  SET_ROOM_LEAVE: 'setRoomLeave',
} as const;

export type SocketEmitEventName =
  (typeof SocketEmitEvent)[keyof typeof SocketEmitEvent];
