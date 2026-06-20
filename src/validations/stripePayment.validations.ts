import Joi from 'joi';

export default {
  payWithCardId: {
    body: Joi.object({
      stripeCardId: Joi.string().required().trim(),
      amount: Joi.number().required().positive(),
      currency: Joi.string().optional().trim().lowercase(),
      description: Joi.string().optional().trim().allow('', null),
      metadata: Joi.object().optional().allow(null),
    }),
  },
};
