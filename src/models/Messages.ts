import mongoose, { Document, Schema, Types } from 'mongoose';

import { ChatType } from '../constants/key.constants';

export interface IMessages extends Document {
  _id: Types.ObjectId;
  roomId: string;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  chatType: ChatType;
  message: string;
  isSeen: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const MessagesSchema = new Schema<IMessages>(
  {
    roomId: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    chatType: {
      type: String,
      enum: Object.values(ChatType),
      required: true,
    },
    message: { type: String, required: true },
    isSeen: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  {
    collection: 'messages',
    toJSON: {
      transform: (_doc, ret) => {
        if (ret.isDeleted) ret.message = '';
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        if (ret.isDeleted) ret.message = '';
        return ret;
      },
    },
  }
);

export const Messages = mongoose.model<IMessages>('messages', MessagesSchema);
