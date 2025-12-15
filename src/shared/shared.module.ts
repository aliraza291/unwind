import { Global, Module, Logger } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.get('typeorm');
      },
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        const logger = new Logger('database-connection');
        logger.log('database-connection' + '-' + dataSource.isInitialized);
        return dataSource;
      },
    }),

    LoggerModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class SharedModule {}
