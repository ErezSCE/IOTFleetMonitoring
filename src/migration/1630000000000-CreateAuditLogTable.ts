import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAuditLogTable1630000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_log',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'entity_type', type: 'varchar', isNullable: false },
          { name: 'entity_id', type: 'uuid', isNullable: true },
          { name: 'action', type: 'varchar', isNullable: false },
          { name: 'performed_by', type: 'uuid', isNullable: true },
          { name: 'performed_at', type: 'timestamptz', default: 'now()' },
          { name: 'before_json', type: 'jsonb', isNullable: true },
          { name: 'after_json', type: 'jsonb', isNullable: true },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_log');
  }
}
