import Joi from 'joi';

export default {
  addCard: {
    body: Joi.object({
      token: Joi.string().required().trim(),
    }),
  },

  stripeCardIdParam: {
    params: Joi.object({
      stripeCardId: Joi.string().required().trim(),
    }),
  },
};
