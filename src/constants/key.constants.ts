export enum DeviceType {
  iOS = 'iOS',
  android = 'android',
}

export enum SocialLoginType {
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
}

export enum ChatType {
  TEXT = 'text',
  FILE = 'file',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}

export enum NotificationType {
  DEPOSIT_SUCCESS = 'deposit_success',
  DEPOSIT_FAILED = 'deposit_failed',
  DEPOSIT_CANCELED = 'deposit_canceled',
  PAYOUT_SUCCESS = 'payout_success',
  PAYOUT_FAILED = 'payout_failed',
  PAYOUT_CANCELED = 'payout_canceled',
  KYC_VERIFIED = 'kyc_verified',
  KYC_REJECTED = 'kyc_rejected',
  DOCUMENT_VERIFICATION_REQUIRED = 'document_verification_required',
  DOCUMENT_VERIFICATION_VERIFIED = 'document_verification_verified',
  DOCUMENT_VERIFICATION_REJECTED = 'document_verification_rejected',
}

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
  SEND_MESSAGE = 'sendMessage',
  UPDATE_MESSAGE = 'updateMessage',
  DELETE_MESSAGE = 'deleteMessage',
}

/**
 * Socket.IO: server -> client (`socket.emit` / `io.to.emit`).
 * Add keys when you introduce push-style events.
 */
export const SocketEmitEvent = {
  SET_ROOM_JOIN: 'setRoomJoin',
  SET_ROOM_LEAVE: 'setRoomLeave',
  SET_SEND_MESSAGE: 'setSendMessage',
  SET_UPDATE_MESSAGE: 'setUpdateMessage',
  SET_DELETE_MESSAGE: 'setDeleteMessage',
  SET_MESSAGE_LIST: 'setMessageList',
  UNREAD_NOTIFICATION_COUNT: 'unreadNotificationCount',
} as const;

export type SocketEmitEventName =
  (typeof SocketEmitEvent)[keyof typeof SocketEmitEvent];

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum KYC_STATUS {
  PENDING = 'pending',
  REQUESTED = 'requested',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum PaymentMethod {
  CARD = 'card',
  BANK = 'bank',
}
