import express from 'express';

import StripePaymentController from '../controllers/stripePayment.controller';
import authMiddleware from '../middlewares/auth.middleware';
import validateRequest from '../middlewares/validateRequest.middleware';
import stripePaymentValidations from '../validations/stripePayment.validations';

const paymentRoutes = express.Router();

paymentRoutes.use(authMiddleware);

// Define payment with card ID endpoints (supporting both spelling variations)
paymentRoutes.post(
  '/PaymentWithCardId',
  validateRequest(stripePaymentValidations.payWithCardId),
  StripePaymentController.payWithCardId
);

export default paymentRoutes;
