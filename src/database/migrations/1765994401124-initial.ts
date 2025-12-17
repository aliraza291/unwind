import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1765994401124 implements MigrationInterface {
    name = 'Initial1765994401124'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "employee" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "empId" character varying NOT NULL, "name" character varying NOT NULL, "designation" character varying NOT NULL, "emailId" character varying NOT NULL, "organizationId" uuid, CONSTRAINT "UQ_a26a4c9888103476de9d80621b8" UNIQUE ("empId"), CONSTRAINT "UQ_096848ce004b2e8e38cf257ec81" UNIQUE ("emailId"), CONSTRAINT "PK_3c2bc72f03fd5abbbc5ac169498" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."company_usertype_enum" AS ENUM('individual', 'therapist', 'company')`);
        await queryRunner.query(`CREATE TABLE "company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "organizationName" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "employeeCount" integer NOT NULL, "workModel" character varying NOT NULL, "subscriptionPlan" character varying NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "otp" character varying, "otpExpiry" TIMESTAMP, "resetPasswordToken" character varying, "resetPasswordExpiry" TIMESTAMP, "userType" "public"."company_usertype_enum" NOT NULL DEFAULT 'company', CONSTRAINT "UQ_b0fc567cf51b1cf717a9e8046a1" UNIQUE ("email"), CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."base_user_usertype_enum" AS ENUM('individual', 'therapist', 'company')`);
        await queryRunner.query(`CREATE TABLE "base_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "userName" character varying, "email" character varying NOT NULL, "password" character varying NOT NULL, "phoneNumber" character varying, "isEmailVerified" boolean NOT NULL DEFAULT false, "otp" character varying, "otpExpiry" TIMESTAMP, "resetPasswordToken" character varying, "resetPasswordExpiry" TIMESTAMP, "userType" "public"."base_user_usertype_enum" NOT NULL DEFAULT 'individual', "companyId" uuid, CONSTRAINT "UQ_28c4f981c5608c6c02b4319efc2" UNIQUE ("email"), CONSTRAINT "PK_fb59959fd207defc2d090661488" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "therapist_employment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "jobTitle" character varying NOT NULL, "employer" character varying NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE, "therapistId" uuid, CONSTRAINT "PK_ef77c66f9c71413e16399638215" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group_therapy" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "description" text, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "maxParticipants" integer NOT NULL DEFAULT '0', "therapistId" uuid NOT NULL, CONSTRAINT "PK_a9c657f01367eddfaa1b7768772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."individual_usertype_enum" AS ENUM('individual', 'therapist', 'company')`);
        await queryRunner.query(`CREATE TABLE "individual" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "userName" character varying, "email" character varying NOT NULL, "password" character varying NOT NULL, "phoneNumber" character varying, "isEmailVerified" boolean NOT NULL DEFAULT false, "otp" character varying, "otpExpiry" TIMESTAMP, "resetPasswordToken" character varying, "resetPasswordExpiry" TIMESTAMP, "userType" "public"."individual_usertype_enum" NOT NULL DEFAULT 'individual', "age" integer NOT NULL, "genderIdentity" character varying NOT NULL, "therapistPreference" text array, "reasonForTherapy" text array, "companyId" uuid, CONSTRAINT "UQ_8d3d302d167f73da844d71e52a6" UNIQUE ("email"), CONSTRAINT "PK_65e322b841a6d5e28a488d584de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."note_type_enum" AS ENUM('Session Notes', 'Priorities', 'Challenges', 'Suggested Sessions', 'Next Appointment')`);
        await queryRunner.query(`CREATE TABLE "note" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "type" "public"."note_type_enum" NOT NULL DEFAULT 'Session Notes', "content" text NOT NULL, "appointmentId" uuid NOT NULL, "createdById" uuid NOT NULL, CONSTRAINT "PK_96d0c172a4fba276b1bbed43058" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."appointment_sessiontype_enum" AS ENUM('Audio', 'Video', 'Audio/Video', 'Text', 'Test')`);
        await queryRunner.query(`CREATE TYPE "public"."appointment_status_enum" AS ENUM('Upcoming', 'Completed', 'Cancelled', 'Rescheduled')`);
        await queryRunner.query(`CREATE TABLE "appointment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "sessionType" "public"."appointment_sessiontype_enum" NOT NULL DEFAULT 'Audio/Video', "status" "public"."appointment_status_enum" NOT NULL DEFAULT 'Upcoming', "duration" integer, "summary" character varying, "consultancyFee" numeric(10,2) NOT NULL DEFAULT '0', "therapistId" uuid NOT NULL, "patientId" uuid NOT NULL, CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."schedule_dayofweek_enum" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`);
        await queryRunner.query(`CREATE TYPE "public"."schedule_status_enum" AS ENUM('Available', 'Booked', 'Selected')`);
        await queryRunner.query(`CREATE TABLE "schedule" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "dayOfWeek" "public"."schedule_dayofweek_enum" NOT NULL, "startTime" TIME NOT NULL, "endTime" TIME NOT NULL, "status" "public"."schedule_status_enum" NOT NULL DEFAULT 'Available', "audioFee" numeric(10,2) NOT NULL DEFAULT '0', "videoFee" numeric(10,2) NOT NULL DEFAULT '0', "audioVideoFee" numeric(10,2) NOT NULL DEFAULT '0', "textFee" numeric(10,2) NOT NULL DEFAULT '0', "therapistId" uuid NOT NULL, CONSTRAINT "PK_1c05e42aec7371641193e180046" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."therapist_usertype_enum" AS ENUM('individual', 'therapist', 'company')`);
        await queryRunner.query(`CREATE TABLE "therapist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "userName" character varying, "email" character varying NOT NULL, "password" character varying NOT NULL, "phoneNumber" character varying, "isEmailVerified" boolean NOT NULL DEFAULT false, "otp" character varying, "otpExpiry" TIMESTAMP, "resetPasswordToken" character varying, "resetPasswordExpiry" TIMESTAMP, "userType" "public"."therapist_usertype_enum" NOT NULL DEFAULT 'individual', "age" integer NOT NULL, "genderIdentity" character varying NOT NULL, "nationality" character varying NOT NULL, "isVerified" boolean NOT NULL DEFAULT true, "specialization" character varying, "title" character varying, "expertise" text array, "cnic" character varying, "careerJourney" text, "profileImage" character varying, "profileCompletionStep" character varying NOT NULL DEFAULT 'personal-info', "isProfileComplete" boolean NOT NULL DEFAULT false, "companyId" uuid, CONSTRAINT "UQ_aba2d7b055068009ab1e6928ae3" UNIQUE ("email"), CONSTRAINT "PK_9d08fe522840812abd402bbf3e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "therapist_qualification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "degreeTitle" character varying NOT NULL, "completionYear" integer NOT NULL, "cgpa" numeric(4,2), "city" character varying NOT NULL, "institute" character varying NOT NULL, "specialization" character varying, "therapistId" uuid, CONSTRAINT "PK_2ddff44e32808b209028d32193c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group_therapy_participants" ("groupTherapyId" uuid NOT NULL, "individualId" uuid NOT NULL, CONSTRAINT "PK_d7e2e522af579006b065c4427d4" PRIMARY KEY ("groupTherapyId", "individualId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ccfc9a5b8229398503c6f1b899" ON "group_therapy_participants" ("groupTherapyId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4e020aa16aa8ff0f078cb1a317" ON "group_therapy_participants" ("individualId") `);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "FK_c6a48286f3aa8ae903bee0d1e72" FOREIGN KEY ("organizationId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "base_user" ADD CONSTRAINT "FK_8afb6cf52b7bd82fd072f58a2e0" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "therapist_employment" ADD CONSTRAINT "FK_67889704679b9cfc5c64d8ca0ac" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_therapy" ADD CONSTRAINT "FK_6baf994b642fb1faa196fc7e8cb" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "individual" ADD CONSTRAINT "FK_1e90132d6e8c2a70badab49fdb9" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "note" ADD CONSTRAINT "FK_0e28def0156e0480558aa647823" FOREIGN KEY ("appointmentId") REFERENCES "appointment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "note" ADD CONSTRAINT "FK_1100c955b41aeaca61ddd9308d4" FOREIGN KEY ("createdById") REFERENCES "therapist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_15d2701bb83b7aef5fdfef379d5" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_5ce4c3130796367c93cd817948e" FOREIGN KEY ("patientId") REFERENCES "individual"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule" ADD CONSTRAINT "FK_89168a1b31b7656757a81e4117d" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "therapist" ADD CONSTRAINT "FK_7de4ffc7c29009532edf88af12d" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "therapist_qualification" ADD CONSTRAINT "FK_8b1b190f6199ffba32b49df4947" FOREIGN KEY ("therapistId") REFERENCES "therapist"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_therapy_participants" ADD CONSTRAINT "FK_ccfc9a5b8229398503c6f1b8997" FOREIGN KEY ("groupTherapyId") REFERENCES "group_therapy"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "group_therapy_participants" ADD CONSTRAINT "FK_4e020aa16aa8ff0f078cb1a3174" FOREIGN KEY ("individualId") REFERENCES "individual"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_therapy_participants" DROP CONSTRAINT "FK_4e020aa16aa8ff0f078cb1a3174"`);
        await queryRunner.query(`ALTER TABLE "group_therapy_participants" DROP CONSTRAINT "FK_ccfc9a5b8229398503c6f1b8997"`);
        await queryRunner.query(`ALTER TABLE "therapist_qualification" DROP CONSTRAINT "FK_8b1b190f6199ffba32b49df4947"`);
        await queryRunner.query(`ALTER TABLE "therapist" DROP CONSTRAINT "FK_7de4ffc7c29009532edf88af12d"`);
        await queryRunner.query(`ALTER TABLE "schedule" DROP CONSTRAINT "FK_89168a1b31b7656757a81e4117d"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_5ce4c3130796367c93cd817948e"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_15d2701bb83b7aef5fdfef379d5"`);
        await queryRunner.query(`ALTER TABLE "note" DROP CONSTRAINT "FK_1100c955b41aeaca61ddd9308d4"`);
        await queryRunner.query(`ALTER TABLE "note" DROP CONSTRAINT "FK_0e28def0156e0480558aa647823"`);
        await queryRunner.query(`ALTER TABLE "individual" DROP CONSTRAINT "FK_1e90132d6e8c2a70badab49fdb9"`);
        await queryRunner.query(`ALTER TABLE "group_therapy" DROP CONSTRAINT "FK_6baf994b642fb1faa196fc7e8cb"`);
        await queryRunner.query(`ALTER TABLE "therapist_employment" DROP CONSTRAINT "FK_67889704679b9cfc5c64d8ca0ac"`);
        await queryRunner.query(`ALTER TABLE "base_user" DROP CONSTRAINT "FK_8afb6cf52b7bd82fd072f58a2e0"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_c6a48286f3aa8ae903bee0d1e72"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4e020aa16aa8ff0f078cb1a317"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ccfc9a5b8229398503c6f1b899"`);
        await queryRunner.query(`DROP TABLE "group_therapy_participants"`);
        await queryRunner.query(`DROP TABLE "therapist_qualification"`);
        await queryRunner.query(`DROP TABLE "therapist"`);
        await queryRunner.query(`DROP TYPE "public"."therapist_usertype_enum"`);
        await queryRunner.query(`DROP TABLE "schedule"`);
        await queryRunner.query(`DROP TYPE "public"."schedule_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."schedule_dayofweek_enum"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP TYPE "public"."appointment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."appointment_sessiontype_enum"`);
        await queryRunner.query(`DROP TABLE "note"`);
        await queryRunner.query(`DROP TYPE "public"."note_type_enum"`);
        await queryRunner.query(`DROP TABLE "individual"`);
        await queryRunner.query(`DROP TYPE "public"."individual_usertype_enum"`);
        await queryRunner.query(`DROP TABLE "group_therapy"`);
        await queryRunner.query(`DROP TABLE "therapist_employment"`);
        await queryRunner.query(`DROP TABLE "base_user"`);
        await queryRunner.query(`DROP TYPE "public"."base_user_usertype_enum"`);
        await queryRunner.query(`DROP TABLE "company"`);
        await queryRunner.query(`DROP TYPE "public"."company_usertype_enum"`);
        await queryRunner.query(`DROP TABLE "employee"`);
    }

}
