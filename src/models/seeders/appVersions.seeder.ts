import { DeviceType } from '../../constants/key.constants';
import { AppVersions } from '../AppVersions';

const appVersionsSeedData: Array<{
  versionCode: string;
  deviceType: DeviceType;
}> = [
  { versionCode: '1', deviceType: DeviceType.android },
  { versionCode: '1.0.0', deviceType: DeviceType.iOS },
];

export default async (): Promise<void> => {
  for (const seedRow of appVersionsSeedData) {
    const existingVersion = await AppVersions.findOne({
      versionCode: seedRow.versionCode,
      deviceType: seedRow.deviceType,
    });

    if (!existingVersion) {
      await AppVersions.create(seedRow);
    }
  }
};
