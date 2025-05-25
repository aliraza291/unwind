import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();
config({ path: `.env.${process.env.NODE_ENV}` });

const prod = process.env.NODE_ENV === 'production';
const APP_NAME: string = process.env.APP_NAME;

function getDataSourceOptions(): DataSourceOptions {
  const dataSourceOptions: DataSourceOptions = {
    applicationName: prod ? `${APP_NAME}-production` : `${APP_NAME}-dev`,
    type: 'postgres',
    host: prod ? process.env.AZURE_POSTGRESQL_HOST : process.env.DATABASE_HOST,
    port:
      parseInt(
        prod ? process.env.AZURE_POSTGRESQL_PORT : process.env.DATABASE_PORT,
        10,
      ) || 5432,
    username: prod
      ? process.env.AZURE_POSTGRESQL_USER
      : process.env.DATABASE_USER_NAME,
    password: prod
      ? process.env.AZURE_POSTGRESQL_PASSWORD
      : process.env.DATABASE_PASSWORD,
    database: prod
      ? process.env.AZURE_POSTGRESQL_DATABASE
      : process.env.DATABASE_NAME,
    maxQueryExecutionTime: 1000,
    // Only use SSL in production
    ssl: prod
      ? {
          rejectUnauthorized:
            process.env.AZURE_POSTGRESQL_SSL_REJECT_UNAUTHORIZED === 'true',
        }
      : false,
    cache: false,
    logging: prod ? ['error', 'log'] : 'all',
    logger: 'advanced-console',
    entities: [`${__dirname}/../**/entities/*.{ts,js}`],
    migrations: [`${__dirname}/../**/migrations/**/*{.ts,.js}`],
    migrationsTableName: 'typeorm_migrations',
    synchronize: false, // never use TRUE in production!
    connectTimeoutMS: 30000,
  };

  return dataSourceOptions;
}

export default registerAs('typeorm', () => getDataSourceOptions());

export const connectionSource = new DataSource(getDataSourceOptions());
