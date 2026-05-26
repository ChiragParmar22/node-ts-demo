import { FindOptionsWhere, IsNull } from 'typeorm';

import { AppDataSource } from '../database/dbConnection';
import { Users } from '../database/entities/Users';

export default class UserRepository {
  private static get repository() {
    return AppDataSource.getRepository(Users);
  }

  static async createUser(userData: Partial<Users>): Promise<Users> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  static async updateUserById(
    id: string,
    data: Partial<Users>
  ): Promise<Users | null> {
    await this.repository.update(id, data);
    return await this.findById(id);
  }

  static async findByEmail(email: string): Promise<Users | null> {
    return await this.repository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  static async findByPhoneNumber(
    countryCode: string,
    phoneNumber: string
  ): Promise<Users | null> {
    return await this.repository.findOne({
      where: { countryCode, phoneNumber, deletedAt: IsNull() },
    });
  }

  static async findById(id: string): Promise<Users | null> {
    return await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  static async findUser(filter: Partial<Users>): Promise<Users | null> {
    return await this.repository.findOne({
      where: { ...filter, deletedAt: IsNull() } as FindOptionsWhere<Users>,
    });
  }
}
