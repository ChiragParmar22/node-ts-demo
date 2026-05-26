import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { DeviceType } from '../../constants/key.constants';

export class Users1745921400003 implements MigrationInterface {
  private readonly table = new Table({
    name: 'users',
    columns: [
      {
        name: 'id',
        type: 'uuid',
        isPrimary: true,
        generationStrategy: 'uuid',
        default: 'uuid_generate_v4()',
      },
      { name: 'name', type: 'varchar', isNullable: false },
      { name: 'email', type: 'varchar', isNullable: false },
      { name: 'countryCode', type: 'varchar', isNullable: true },
      { name: 'phoneNumber', type: 'varchar', isNullable: true },
      {
        name: 'deviceType',
        type: 'enum',
        enum: [...Object.values(DeviceType)],
        isNullable: true,
        enumName: 'users_deviceType_enum',
      },
      { name: 'deviceToken', type: 'varchar', isNullable: true },
      { name: 'password', type: 'varchar', isNullable: false },
      { name: 'profilePicture', type: 'varchar', isNullable: true },
      { name: 'socketId', type: 'varchar', isNullable: true },
      { name: 'lat', type: 'numeric', precision: 10, scale: 7, default: 0 },
      { name: 'lng', type: 'numeric', precision: 10, scale: 7, default: 0 },
      { name: 'deleteReason', type: 'text', isNullable: true },
      { name: 'createdAt', type: 'timestamp', default: 'now()' },
      { name: 'updatedAt', type: 'timestamp', default: 'now()' },
      { name: 'deletedAt', type: 'timestamp', isNullable: true },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
    await queryRunner.query('DROP TYPE IF EXISTS "users_deviceType_enum"');
  }
}
