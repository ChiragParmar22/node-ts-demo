import mongoose, { Document, Schema, Types } from 'mongoose';

import { NotificationStatus } from '../constants/key.constants';

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  status: NotificationStatus | null;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: [...Object.values(NotificationStatus), null],
      default: null,
    },
    readAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  { collection: 'notifications' }
);

export const Notification = mongoose.model<INotification>(
  'notifications',
  NotificationSchema
);
