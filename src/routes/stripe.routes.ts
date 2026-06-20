import express from 'express';

import customerRoutes from './customer.routes';

const stripeRoutes = express.Router();

stripeRoutes.use('/customer', customerRoutes);

export default stripeRoutes;
