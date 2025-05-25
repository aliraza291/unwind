import { MigrationInterface, QueryRunner } from "typeorm";

export class Prod0327251747546280843 implements MigrationInterface {
    name = 'Prod0327251747546280843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "therapist_qualification" DROP COLUMN "completionYear"`);
        await queryRunner.query(`ALTER TABLE "therapist_qualification" ADD "completionYear" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "therapist_qualification" DROP COLUMN "completionYear"`);
        await queryRunner.query(`ALTER TABLE "therapist_qualification" ADD "completionYear" integer NOT NULL`);
    }

}
