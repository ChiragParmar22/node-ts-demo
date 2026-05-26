import Joi from 'joi';

export default {
  createContactUs: {
    body: Joi.object({
      name: Joi.string().required().trim(),
      email: Joi.string().trim().email().lowercase().required(),
      subject: Joi.string().required().trim(),
      message: Joi.string().required().trim(),
    }),
  },
};
