import Joi from 'joi';

export default {
  stripeCustomerSchema: {
    body: Joi.object({
      addressLine1: Joi.string().trim().optional().allow('', null),
      addressLine2: Joi.string().trim().optional().allow('', null),
      city: Joi.string().trim().optional().allow('', null),
      postalCode: Joi.string().trim().optional().allow('', null),
      state: Joi.string().trim().optional().allow('', null),
      country: Joi.string().trim().optional().allow('', null),
    }),
  },
};
