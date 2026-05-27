import { FilterQuery, Types } from 'mongoose';

import { IUsers, Users } from '../models/Users';

export default class UserRepository {
  static async createUser(userData: Partial<IUsers>): Promise<IUsers> {
    return await Users.create(userData);
  }

  static async updateUserById(
    id: string | Types.ObjectId,
    data: Partial<IUsers>
  ): Promise<IUsers | null> {
    return await Users.findByIdAndUpdate(id, {
      ...data,
      updatedDate: new Date(),
    });
  }

  static async findByEmail(email: string): Promise<IUsers | null> {
    return await Users.findOne({ email, deletedAt: null });
  }

  static async findByPhoneNumber(
    countryCode: string,
    phoneNumber: string
  ): Promise<IUsers | null> {
    return await Users.findOne({
      countryCode,
      phoneNumber,
      deletedAt: null,
    });
  }

  static async findById(id: string | Types.ObjectId): Promise<IUsers | null> {
    return await Users.findOne({ _id: id, deletedAt: null });
  }

  static async findUser(filter: FilterQuery<IUsers>): Promise<IUsers | null> {
    return await Users.findOne({ ...filter, deletedAt: null });
  }
}
