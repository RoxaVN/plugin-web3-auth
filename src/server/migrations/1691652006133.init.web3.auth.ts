import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitWeb3Auth1691652006133 implements MigrationInterface {
  name = 'InitWeb3Auth1691652006133';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "web3_auth" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "address" text NOT NULL,
        "message" text NOT NULL,
        "metadata" jsonb,
        "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_975b6d8a04d6d62d7c1427bb621" PRIMARY KEY ("id")
      )
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "web3_auth"
      `);
  }
}
