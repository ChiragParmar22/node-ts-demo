import { DeviceType } from '../constants/key.constants';
import { AppVersions, IAppVersions } from '../models/AppVersions';

export default class AppVersionsRepository {
  static async findByDeviceTypeAndVersionCode(
    deviceType: DeviceType,
    versionCode: string
  ): Promise<IAppVersions | null> {
    return await AppVersions.findOne({ deviceType, versionCode });
  }
}
