import { Router } from 'express';

import ContactUsController from '../controllers/contactUs.controller';
import validateRequest from '../middlewares/validateRequest.middleware';
import contactUsValidation from '../validations/contactUs.validations';

const router = Router();

router.post(
  '/',
  validateRequest(contactUsValidation.createContactUs),
  ContactUsController.createContactUs
);

export default router;
