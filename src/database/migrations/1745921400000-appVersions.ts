import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { DeviceType } from '../../constants/key.constants';

export class AppVersions1745921400000 implements MigrationInterface {
  private readonly table = new Table({
    name: 'appVersions',
    columns: [
      {
        name: 'id',
        type: 'uuid',
        isPrimary: true,
        generationStrategy: 'uuid',
        default: 'uuid_generate_v4()',
      },
      {
        name: 'deviceType',
        type: 'enum',
        enum: [DeviceType.iOS, DeviceType.android],
        isNullable: true,
        enumName: 'appVersions_deviceType_enum',
      },
      { name: 'versionCode', type: 'varchar', isNullable: false },
      { name: 'createdAt', type: 'timestamp', default: 'now()' },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(this.table, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
    await queryRunner.query(
      'DROP TYPE IF EXISTS "appVersions_deviceType_enum"'
    );
  }
}
