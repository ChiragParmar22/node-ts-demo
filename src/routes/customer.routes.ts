import express from 'express';

import StripeCustomerController from '../controllers/stripeCustomer.controller';
import authMiddleware from '../middlewares/auth.middleware';
import validateRequest from '../middlewares/validateRequest.middleware';
import stripeCustomerValidations from '../validations/stripeCustomer.validations';

const customerRoutes = express.Router();

customerRoutes.use(authMiddleware);

customerRoutes.post(
  '/create',
  validateRequest(stripeCustomerValidations.stripeCustomerSchema),
  StripeCustomerController.createCustomer
);

customerRoutes.get('/', StripeCustomerController.getCustomer);

customerRoutes.put(
  '/update',
  validateRequest(stripeCustomerValidations.stripeCustomerSchema),
  StripeCustomerController.updateCustomer
);

customerRoutes.delete('/delete', StripeCustomerController.deleteCustomer);

export default customerRoutes;
