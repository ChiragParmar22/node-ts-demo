import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ContactUs1745921400002 implements MigrationInterface {
  private readonly table = new Table({
    name: 'contactUs',
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
      { name: 'subject', type: 'varchar', isNullable: false },
      { name: 'message', type: 'text', isNullable: false },
      { name: 'createdAt', type: 'timestamp', default: 'now()' },
      { name: 'updatedAt', type: 'timestamp', default: 'now()' },
    ],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }
}
