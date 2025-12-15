import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_SECURITY_AUTH } from './common/decorators/swagger.decorator';
import { appName, isSwagger, port, swaggerPath } from './constants/env';

export function setupSwagger(app: INestApplication): void {
  if (isSwagger == 'false') {
    return;
  }
  const documentBuilder = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(`${appName} API document`)
    .setVersion('1.0');

  // auth security
  documentBuilder.addSecurity(API_SECURITY_AUTH, {
    description: 'Auth',
    type: 'apiKey',
    in: 'header',
    name: 'Authorization',
  });

  const document = SwaggerModule.createDocument(app, documentBuilder.build(), {
    ignoreGlobalPrefix: false,
  });

  SwaggerModule.setup(swaggerPath, app, document);
  // started log
  const logger = new Logger('SwaggerModule');
  logger.log(
    `Swagger Document running on http://localhost:${port}/${swaggerPath}`,
  );
}
