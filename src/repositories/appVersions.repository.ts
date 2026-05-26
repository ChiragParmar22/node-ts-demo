import { DeviceType } from '../constants/key.constants';
import { AppDataSource } from '../database/dbConnection';
import { AppVersions } from '../database/entities/AppVersions';

export default class AppVersionsRepository {
  private static get repository() {
    return AppDataSource.getRepository(AppVersions);
  }

  static async findByDeviceTypeAndVersionCode(
    deviceType: DeviceType,
    versionCode: string
  ): Promise<AppVersions | null> {
    return await this.repository.findOne({
      where: { deviceType, versionCode },
    });
  }
}
