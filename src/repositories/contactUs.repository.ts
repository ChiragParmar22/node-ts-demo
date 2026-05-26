import { AppDataSource } from '../database/dbConnection';
import { ContactUs } from '../database/entities/ContactUs';

export default class ContactUsRepository {
  private static get repository() {
    return AppDataSource.getRepository(ContactUs);
  }

  static async createContactUs(data: Partial<ContactUs>): Promise<ContactUs> {
    const contactUs = this.repository.create(data);
    return await this.repository.save(contactUs);
  }
}
