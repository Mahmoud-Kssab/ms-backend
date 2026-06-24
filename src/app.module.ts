import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { appConfig } from './common/config/app.config';
import { databaseConfig } from './common/config/database.config';
import { redisConfig } from './common/config/redis.config';
import { RedisProviderModule } from './common/providers/redis-provider.module';
import { AuthModule } from './features/auth/auth.module';
import { ChannelsModule } from './features/channels/channels.module';
import { HealthModule } from './features/health/health.module';
import { RbacModule } from './features/rbac/rbac.module';
import { RealtimeModule } from './features/realtime/realtime.module';
import { UsersModule } from './features/users/users.module';
import { WebhooksModule } from './features/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: 'postgres',
        host: process.env.DATABASE_HOST ?? '127.0.0.1',
        port: Number(process.env.DATABASE_PORT ?? 5432),
        database: process.env.DATABASE_NAME ?? 'messaging_saas',
        username: process.env.DATABASE_USER ?? 'postgres',
        password: process.env.DATABASE_PASSWORD ?? 'postgres',
        autoLoadModels: true,
        synchronize: false,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
      }),
    }),
    RedisProviderModule,
    AuthModule,
    ChannelsModule,
    HealthModule,
    RbacModule,
    RealtimeModule,
    UsersModule,
    WebhooksModule,
  ],
})
export class AppModule {}
