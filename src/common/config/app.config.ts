import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  host: process.env.HOST ?? '127.0.0.1',
  port: Number(process.env.PORT ?? 3002),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://127.0.0.1:3000',
}));
