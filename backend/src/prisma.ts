import { PrismaClient } from '@prisma/client';
import { config } from './config';

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required for Prisma to connect');
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
});
