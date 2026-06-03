import { NextFunction, Request, Response } from 'express';

import { CreateContactUsBody } from '../interfaces/contactUs.interface';
import ContactUsService from '../services/contactUs.service';
import ApiResponse from '../utils/apiResponse';

export default class ContactUsController {
  static async createContactUs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<unknown> {
    try {
      const result = await ContactUsService.createContactUs(
        req.body as CreateContactUsBody
      );
      return res.status(result.statusCode).json(result);
    } catch (error) {
      return next(ApiResponse.badRequest(error as string));
    }
  }
}
