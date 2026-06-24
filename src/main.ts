import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);
  const frontendOrigin = configService.getOrThrow<string>('app.frontendOrigin');
  const allowedOrigins = new Set([
    frontendOrigin,
    'http://127.0.0.1:3000',
    'http://localhost:3000',
  ]);

  app.enableCors({
    // Allow the configured frontend plus both supported local development hosts.
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.getOrThrow<number>('app.port');
  const host = configService.getOrThrow<string>('app.host');
  await app.listen(port, host);
}

void bootstrap();
