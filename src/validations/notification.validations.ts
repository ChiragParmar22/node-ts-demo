import Joi from 'joi';

export default {
  getNotificationsSchema: {
    query: Joi.object({
      skip: Joi.number().integer().min(0).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
    }),
  },
};
