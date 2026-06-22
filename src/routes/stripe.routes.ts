import express from 'express';

import cardRoutes from './card.routes';
import customerRoutes from './customer.routes';
import paymentRoutes from './payment.routes';
import stripeExternalAccountRoutes from './stripeExternalAccount.routes';
import webhookRoutes from './webhook.routes';

const stripeRoutes = express.Router();

stripeRoutes.use('/customer', customerRoutes);
stripeRoutes.use('/card', cardRoutes);
stripeRoutes.use('/webhook', webhookRoutes);
stripeRoutes.use('/payment', paymentRoutes);
stripeRoutes.use('/externalAccount', stripeExternalAccountRoutes);

export default stripeRoutes;
