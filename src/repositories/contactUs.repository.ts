import { ContactUs, IContactUs } from '../models/ContactUs';

export default class ContactUsRepository {
  static async createContactUs(data: Partial<IContactUs>): Promise<IContactUs> {
    return await ContactUs.create(data);
  }
}
