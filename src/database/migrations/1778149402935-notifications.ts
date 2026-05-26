import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

import {
  NotificationStatus,
  NotificationType,
} from '../../constants/key.constants';

export class Notifications1778149402935 implements MigrationInterface {
  private readonly table = new Table({
    name: 'notifications',
    columns: [
      {
        name: 'id',
        type: 'uuid',
        isPrimary: true,
        generationStrategy: 'uuid',
        default: 'uuid_generate_v4()',
      },
      { name: 'userId', type: 'uuid', isNullable: false },
      {
        name: 'type',
        type: 'enum',
        enum: [...Object.values(NotificationType)],
        isNullable: false,
        enumName: 'notifications_type_enum',
      },
      { name: 'title', type: 'varchar', isNullable: false },
      { name: 'message', type: 'varchar', isNullable: false },
      { name: 'data', type: 'jsonb', isNullable: true },
      {
        name: 'status',
        type: 'enum',
        enum: [...Object.values(NotificationStatus)],
        isNullable: true,
        enumName: 'notifications_status_enum',
        default: null,
      },
      { name: 'readAt', type: 'timestamp', isNullable: true },
      { name: 'createdAt', type: 'timestamp', default: 'now()' },
      { name: 'updatedAt', type: 'timestamp', default: 'now()' },
      { name: 'deletedAt', type: 'timestamp', isNullable: true },
    ],
    foreignKeys: [
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
    await queryRunner.query('DROP TYPE IF EXISTS "notifications_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "notifications_type_enum"');
  }
}
