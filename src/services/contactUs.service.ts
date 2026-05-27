import config from '../configs/common.config';
import messagesConstants from '../constants/messages.constants';
import { IContactUs } from '../models/ContactUs';
import ContactUsRepository from '../repositories/contactUs.repository';
import ApiResponse from '../utils/apiResponse';
import { ContactUsArgs, contactUsMail } from '../utils/emailContent';
import sendEmail from '../utils/sendEmail';

export default class ContactUsService {
  static async createContactUs(
    data: Partial<IContactUs>
  ): Promise<ApiResponse> {
    await ContactUsRepository.createContactUs(data);

    const emailContent = contactUsMail({
      ...(data as ContactUsArgs),
    });

    const clientEmail = config.CLIENT_EMAIL;
    await sendEmail(
      clientEmail,
      'Contact Us email from ' + config.APP_NAME,
      emailContent
    );

    return ApiResponse.created({}, messagesConstants.CONTACT_US_MESSAGE);
  }
}
