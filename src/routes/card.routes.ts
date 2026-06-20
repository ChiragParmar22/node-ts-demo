import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

import config from '../configs/common.config';
import StripeCardController from '../controllers/stripeCard.controller';
import authMiddleware from '../middlewares/auth.middleware';
import validateRequest from '../middlewares/validateRequest.middleware';
import stripeCardValidations from '../validations/stripeCard.validations';

const cardRoutes = express.Router();

// Serve add card HTML view (public, no auth needed)
cardRoutes.get('/addCard', (_request: Request, response: Response) => {
  const htmlPath = path.join(__dirname, '..', 'views', 'addCard.html');
  let html = fs.readFileSync(htmlPath, 'utf-8');

  html = html.replace(
    '{{STRIPE_PUBLISHABLE_KEY}}',
    config.STRIPE_PUBLISHABLE_KEY
  );
  html = html.replace('{{API_BASE_URL}}', config.SERVER_URL);

  return response.send(html);
});

cardRoutes.use(authMiddleware);

cardRoutes.post(
  '/add',
  validateRequest(stripeCardValidations.addCard),
  StripeCardController.addCard
);

cardRoutes.get('/list', StripeCardController.getAllCards);

cardRoutes.get(
  '/:stripeCardId',
  validateRequest(stripeCardValidations.stripeCardIdParam),
  StripeCardController.getCard
);

cardRoutes.delete(
  '/delete/:stripeCardId',
  validateRequest(stripeCardValidations.stripeCardIdParam),
  StripeCardController.deleteCard
);

cardRoutes.put(
  '/primary/:stripeCardId',
  validateRequest(stripeCardValidations.stripeCardIdParam),
  StripeCardController.makePrimary
);

export default cardRoutes;
