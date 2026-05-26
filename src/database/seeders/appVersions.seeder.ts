import { DeviceType } from '../../constants/key.constants';
import { AppDataSource } from '../dbConnection';
import { AppVersions } from '../entities/AppVersions';

const appVersionsSeedData: Array<{
  versionCode: string;
  deviceType: DeviceType;
}> = [
  { versionCode: '1', deviceType: DeviceType.android },
  { versionCode: '1.0.0', deviceType: DeviceType.iOS },
];

export default async (): Promise<void> => {
  const repository = AppDataSource.getRepository(AppVersions);

  for (const seedRow of appVersionsSeedData) {
    const existingVersion = await repository.findOne({
      where: {
        versionCode: seedRow.versionCode,
        deviceType: seedRow.deviceType,
      },
    });

    if (!existingVersion) {
      const appVersion = repository.create(seedRow);
      await repository.save(appVersion);
    }
  }
};
