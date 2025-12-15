import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1745350629158 implements MigrationInterface {
    name = 'Initial1745350629158'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "base_user" ADD "userName" character varying`);
        await queryRunner.query(`ALTER TABLE "therapist" ADD "userName" character varying`);
        await queryRunner.query(`ALTER TABLE "therapist" ADD "profileCompletionStep" character varying NOT NULL DEFAULT 'personal-info'`);
        await queryRunner.query(`ALTER TABLE "individual" ADD "userName" character varying`);
        await queryRunner.query(`ALTER TABLE "therapist" ALTER COLUMN "isVerified" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "individual" DROP COLUMN "therapistPreference"`);
        await queryRunner.query(`ALTER TABLE "individual" ADD "therapistPreference" text array`);
        await queryRunner.query(`ALTER TABLE "individual" DROP COLUMN "reasonForTherapy"`);
        await queryRunner.query(`ALTER TABLE "individual" ADD "reasonForTherapy" text array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "individual" DROP COLUMN "reasonForTherapy"`);
        await queryRunner.query(`ALTER TABLE "individual" ADD "reasonForTherapy" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "individual" DROP COLUMN "therapistPreference"`);
        await queryRunner.query(`ALTER TABLE "individual" ADD "therapistPreference" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "therapist" ALTER COLUMN "isVerified" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "individual" DROP COLUMN "userName"`);
        await queryRunner.query(`ALTER TABLE "therapist" DROP COLUMN "profileCompletionStep"`);
        await queryRunner.query(`ALTER TABLE "therapist" DROP COLUMN "userName"`);
        await queryRunner.query(`ALTER TABLE "base_user" DROP COLUMN "userName"`);
    }

}
