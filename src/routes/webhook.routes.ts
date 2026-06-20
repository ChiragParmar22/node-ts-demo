import express from 'express';

import StripeWebhookController from '../controllers/stripeWebhook.controller';

const webhookRoutes = express.Router();

// Public Stripe Webhook Endpoint
webhookRoutes.post('/', StripeWebhookController.handleWebhook);

export default webhookRoutes;
