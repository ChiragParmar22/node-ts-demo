import Joi from 'joi';

export default {
  createExternalAccount: {
    body: Joi.object({
      country: Joi.string()
        .trim()
        .length(2)
        .uppercase()
        .optional()
        .allow('', null),
    }),
  },
};
