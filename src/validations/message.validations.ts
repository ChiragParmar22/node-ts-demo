import Joi from 'joi';

import { ChatType } from '../constants/key.constants';
import messagesConstants from '../constants/messages.constants';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export default {
  sendMessageSchema: Joi.object({
    receiverId: Joi.string().regex(objectIdPattern).required().messages({
      'string.pattern.base': messagesConstants.INVALID_RECEIVER_ID,
    }),
    chatType: Joi.string()
      .valid(...Object.values(ChatType))
      .required(),
    message: Joi.string().trim().min(1).required(),
  }),

  updateMessageSchema: Joi.object({
    messageId: Joi.string().regex(objectIdPattern).required().messages({
      'string.pattern.base': messagesConstants.INVALID_MESSAGE_ID,
    }),
    message: Joi.string().trim().min(1).required(),
  }),

  deleteMessageSchema: Joi.object({
    messageId: Joi.string().regex(objectIdPattern).required().messages({
      'string.pattern.base': messagesConstants.INVALID_MESSAGE_ID,
    }),
  }),

  uploadSchema: {
    body: Joi.object({
      chatType: Joi.string()
        .valid(
          ...Object.values(ChatType).filter((type) => type !== ChatType.TEXT)
        )
        .required(),
    }),
  },

  getMessagesSchema: {
    query: Joi.object({
      skip: Joi.number().integer().min(0).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      search: Joi.string().trim().max(100).allow('').optional(),
    }),
  },
};
