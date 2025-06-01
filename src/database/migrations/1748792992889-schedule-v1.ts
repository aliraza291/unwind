import { MigrationInterface, QueryRunner } from "typeorm";

export class ScheduleV11748792992889 implements MigrationInterface {
    name = 'ScheduleV11748792992889'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule" ADD "gapBetweenSlots" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "schedule" ADD "date" date`);
        await queryRunner.query(`ALTER TABLE "therapist_qualification" DROP COLUMN "completionYear"`);
        await queryRunner.query(`ALTER TABLE "therapist_qualification" ADD "completionYear" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "therapist_qualification" DROP COLUMN "completionYear"`);
        await queryRunner.query(`ALTER TABLE "therapist_qualification" ADD "completionYear" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "schedule" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "schedule" DROP COLUMN "gapBetweenSlots"`);
    }

}
