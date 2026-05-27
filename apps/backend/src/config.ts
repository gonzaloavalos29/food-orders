import 'dotenv/config';

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  databaseUrl: required('DATABASE_URL', process.env.DATABASE_URL),
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: required('JWT_SECRET', process.env.JWT_SECRET),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '24h',
  corsOrigin: process.env.CORS_ORIGIN ?? '*'
};
