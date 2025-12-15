import * as express from 'express';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { HttpStatus, Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger-setup';
import { LoggerService } from './shared/logger/logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { isDev, port, globalPrefix, corsLinks } from './constants/env';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    snapshot: true,
    cors: true,
  });
  app.use(express.json({ limit: '50mb' }));
  app.use(
    express.urlencoded({ limit: '10mb', extended: true }), // Increase URL-encoded body limit
  );
  app.enableCors({
    origin: corsLinks,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: true,
    maxAge: 3600,
  });

  // Helmet configureation to guard the headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https:',
            'http:',
          ],
          styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
          imgSrc: ["'self'", 'data:', 'https:', 'http:'],
          connectSrc: ["'self'", 'http://localhost:3000'],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'", 'https:', 'http:'],
          frameSrc: ["'self'", 'https:', 'http:'],
          workerSrc: ["'self'", 'blob:'],
          childSrc: ["'self'", 'blob:'],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    }),
  );
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: false,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  // enableShutdownHooks for graceful shutdown on sigterm signal
  !isDev && app.enableShutdownHooks();

  // swagger setup
  setupSwagger(app);

  await app.listen(port, '0.0.0.0', async () => {
    app.useLogger(app.get(LoggerService));
    const url = await app.getUrl();

    const logger = new Logger('NestApplication');

    logger.log(`server is running at : ${url}/api and port ${port}`);

    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }
  });
}

bootstrap();
