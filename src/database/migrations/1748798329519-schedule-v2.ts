import { MigrationInterface, QueryRunner } from "typeorm";

export class ScheduleV21748798329519 implements MigrationInterface {
    name = 'ScheduleV21748798329519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "schedule" ADD "date" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "schedule" ADD "date" date`);
    }

}
