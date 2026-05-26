import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class OtpMaster1745921400001 implements MigrationInterface {
  private readonly table = new Table({
    name: 'otpMaster',
    columns: [
      {
        name: 'id',
        type: 'uuid',
        isPrimary: true,
        generationStrategy: 'uuid',
        default: 'uuid_generate_v4()',
      },
      { name: 'email', type: 'varchar', isNullable: false },
      { name: 'otp', type: 'varchar', isNullable: false },
      { name: 'createdAt', type: 'timestamp', default: 'now()' },
      { name: 'expireAt', type: 'timestamp', isNullable: false },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table, true);

    await queryRunner.createIndex(
      'otpMaster',
      new TableIndex({
        name: 'IDX_otpMaster_email',
        columnNames: ['email'],
      })
    );

    await queryRunner.createIndex(
      'otpMaster',
      new TableIndex({
        name: 'IDX_otpMaster_expireAt',
        columnNames: ['expireAt'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(this.table, 'IDX_otpMaster_expireAt');
    await queryRunner.dropIndex(this.table, 'IDX_otpMaster_email');
    await queryRunner.dropTable(this.table);
  }
}
