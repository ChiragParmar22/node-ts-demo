import { AppleUsers, IAppleUsers } from '../models/AppleUsers';

export default class AppleUsersRepository {
  static async findByAppleId(appleId: string): Promise<IAppleUsers | null> {
    return await AppleUsers.findOne({ appleId });
  }

  static async upsertByAppleId(
    appleId: string,
    email: string
  ): Promise<IAppleUsers> {
    return await AppleUsers.findOneAndUpdate(
      { appleId },
      { appleId, email, updatedAt: new Date() },
      { upsert: true, new: true }
    );
  }
}
