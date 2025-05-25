import { Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { config } from 'dotenv';
import typeorm from './config/database.config';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ScheduleModule } from './modules/schedule/schedules.module';

config();

@Module({
  imports: [
    // Add ConfigModule.forRoot() to the imports array, and pass in an
    // optional configuration object if needed like envs and other configurations
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', `.env.${process.env.NODE_ENV}`, '.env'],
      load: [typeorm],
    }),

    // Add ThrottlerModule.forRoot() to protect applications
    //from brute-force attacks is rate-limiting limit is 10 for in 60sec (min)

    // Importing modules
    AppointmentsModule,
    ScheduleModule,
    SharedModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure() {
    // Apply middlewares here if needed
    // Example:
    // consumer.apply(SomeMiddleware).forRoutes('some-route');
  }
}
