import express from 'express';

import StripeExternalAccountController from '../controllers/stripeExternalAccount.controller';
import authMiddleware from '../middlewares/auth.middleware';
import validateRequest from '../middlewares/validateRequest.middleware';
import stripeExternalAccountValidations from '../validations/stripeExternalAccount.validations';

const stripeExternalAccountRoutes = express.Router();

// Onboard connected account & create onboarding link
stripeExternalAccountRoutes.post(
  '/create',
  authMiddleware,
  validateRequest(stripeExternalAccountValidations.createExternalAccount),
  StripeExternalAccountController.createExternalAccount
);

// Refresh callback (regenerates link & redirects)
stripeExternalAccountRoutes.get(
  '/refresh/:token',
  StripeExternalAccountController.handleRefresh
);

// Success callback (reads onboarding status & stores bank details)
stripeExternalAccountRoutes.get(
  '/success',
  StripeExternalAccountController.handleSuccess
);

export default stripeExternalAccountRoutes;
