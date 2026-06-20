import express from 'express';

import cardRoutes from './card.routes';
import customerRoutes from './customer.routes';

const stripeRoutes = express.Router();

stripeRoutes.use('/customer', customerRoutes);
stripeRoutes.use('/card', cardRoutes);

export default stripeRoutes;
