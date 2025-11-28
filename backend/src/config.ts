import dotenv from 'dotenv';

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number): number => {
  const asNumber = Number(value);
  return Number.isFinite(asNumber) ? asNumber : fallback;
};

const rawOrigins = process.env.CORS_ORIGINS ?? '';
const corsOrigins = rawOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseNumber(process.env.PORT, 4000),
  corsOrigins,
  databaseUrl: process.env.DATABASE_URL,
};

export const isProduction = config.nodeEnv === 'production';
export const isRunningInLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
