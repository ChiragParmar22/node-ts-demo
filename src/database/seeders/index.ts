import appVersionsSeeder from './appVersions.seeder';

export default async (): Promise<void> => {
  await appVersionsSeeder();
};
