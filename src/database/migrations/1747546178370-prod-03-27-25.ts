import { MigrationInterface, QueryRunner } from "typeorm";

export class Prod0327251747546178370 implements MigrationInterface {
    name = 'Prod0327251747546178370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "employee" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "empId" character varying NOT NULL, "name" character varying NOT NULL, "designation" character varying NOT NULL, "emailId" character varying NOT NULL, "organizationId" uuid, CONSTRAINT "UQ_a26a4c9888103476de9d80621b8" UNIQUE ("empId"), CONSTRAINT "UQ_096848ce004b2e8e38cf257ec81" UNIQUE ("emailId"), CONSTRAINT "PK_3c2bc72f03fd5abbbc5ac169498" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group_therapy" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "description" text, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "maxParticipants" integer NOT NULL DEFAULT '0', "therapistId" uuid NOT NULL, CONSTRAINT "PK_a9c657f01367eddfaa1b7768772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."note_type_enum" AS ENUM('Session Notes', 'Priorities', 'Challenges', 'Suggested Sessions', 'Next Appointment')`);
        await queryRunner.query(`CREATE TABLE "note" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "type" "public"."note_type_enum" NOT NULL DEFAULT 'Session Notes', "content" text NOT NULL, "appointmentId" uuid NOT NULL, "createdById" uuid NOT NULL, CONSTRAINT "PK_96d0c172a4fba276b1bbed43058" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."appointment_sessiontype_enum" AS ENUM('Audio', 'Video', 'Audio/Video', 'Text', 'Test')`);
        await queryRunner.query(`CREATE TYPE "public"."appointment_status_enum" AS ENUM('Upcoming', 'Completed', 'Cancelled', 'Rescheduled')`);
        await queryRunner.query(`CREATE TABLE "appointment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "sessionType" "public"."appointment_sessiontype_enum" NOT NULL DEFAULT 'Audio/Video', "status" "public"."appointment_status_enum" NOT NULL DEFAULT 'Upcoming', "duration" integer, "summary" character varying, "consultancyFee" numeric(10,2) NOT NULL DEFAULT '0', "therapistId" uuid NOT NULL, "patientId" uuid NOT NULL, CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."schedule_dayofweek_enum" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`);
        await queryRunner.query(`CREATE TYPE "public"."schedule_status_enum" AS ENUM('Available', 'Booked', 'Selected')`);
        await queryRunner.query(`CREATE TABLE "schedule" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "dayOfWeek" "public"."schedule_dayofweek_enum" NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "status" "public"."schedule_status_enum" NOT NULL DEFAULT 'Available', "audioFee" numeric(10,2) NOT NULL DEFAULT '0', "videoFee" numeric(10,2) NOT NULL DEFAULT '0', "audioVideoFee" numeric(10,2) NOT NULL DEFAULT '0', "textFee" numeric(10,2) NOT NULL DEFAULT '0', "therapistId" uuid NOT NULL, CONSTRAINT "PK_1c05e42aec7371641193e180046" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group_therapy_participants" ("groupTherapyId" uuid NOT NULL, "individualId" uuid NOT NULL, CONSTRAINT "PK_d7e2e522af579006b065c4427d4" PRIMARY KEY ("groupTherapyId", "individualId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ccfc9a5b8229398503c6f1b899" ON "group_therapy_participants" ("groupTherapyId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4e020aa16aa8ff0f078cb1a317" ON "group_therapy_participants" ("individualId") `);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "FK_c6a48286f3aa8ae903bee0d1e72" FOREIGN KEY ("organizationId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_therapy" ADD CONSTRAINT "FK_6baf994b642fb1faa196fc7e8cb" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "note" ADD CONSTRAINT "FK_0e28def0156e0480558aa647823" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "note" ADD CONSTRAINT "FK_1100c955b41aeaca61ddd9308d4" FOREIGN KEY ("createdById") REFERENCES "therapist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_15d2701bb83b7aef5fdfef379d5" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_5ce4c3130796367c93cd817948e" FOREIGN KEY ("patientId") REFERENCES "individual"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule" ADD CONSTRAINT "FK_89168a1b31b7656757a81e4117d" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_therapy_participants" ADD CONSTRAINT "FK_ccfc9a5b8229398503c6f1b8997" FOREIGN KEY ("groupTherapyId") REFERENCES "group_therapy"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "group_therapy_participants" ADD CONSTRAINT "FK_4e020aa16aa8ff0f078cb1a3174" FOREIGN KEY ("individualId") REFERENCES "individual"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_therapy_participants" DROP CONSTRAINT "FK_4e020aa16aa8ff0f078cb1a3174"`);
        await queryRunner.query(`ALTER TABLE "group_therapy_participants" DROP CONSTRAINT "FK_ccfc9a5b8229398503c6f1b8997"`);
        await queryRunner.query(`ALTER TABLE "schedule" DROP CONSTRAINT "FK_89168a1b31b7656757a81e4117d"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_5ce4c3130796367c93cd817948e"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_15d2701bb83b7aef5fdfef379d5"`);
        await queryRunner.query(`ALTER TABLE "note" DROP CONSTRAINT "FK_1100c955b41aeaca61ddd9308d4"`);
        await queryRunner.query(`ALTER TABLE "note" DROP CONSTRAINT "FK_0e28def0156e0480558aa647823"`);
        await queryRunner.query(`ALTER TABLE "group_therapy" DROP CONSTRAINT "FK_6baf994b642fb1faa196fc7e8cb"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_c6a48286f3aa8ae903bee0d1e72"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4e020aa16aa8ff0f078cb1a317"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ccfc9a5b8229398503c6f1b899"`);
        await queryRunner.query(`DROP TABLE "group_therapy_participants"`);
        await queryRunner.query(`DROP TABLE "schedule"`);
        await queryRunner.query(`DROP TYPE "public"."schedule_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."schedule_dayofweek_enum"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP TYPE "public"."appointment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."appointment_sessiontype_enum"`);
        await queryRunner.query(`DROP TABLE "note"`);
        await queryRunner.query(`DROP TYPE "public"."note_type_enum"`);
        await queryRunner.query(`DROP TABLE "group_therapy"`);
        await queryRunner.query(`DROP TABLE "employee"`);
    }

}
