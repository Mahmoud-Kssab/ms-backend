import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import Redis from 'ioredis';

import { REDIS_CLIENT } from '../../../common/providers/redis.constants';

@Injectable()
export class HealthService {
  constructor(
    private readonly sequelize: Sequelize,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async getHealth() {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    return {
      status: database === 'up' && redis === 'up' ? 'ok' : 'degraded',
      services: {
        database,
        redis,
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase() {
    try {
      await this.sequelize.query('SELECT 1');
      return 'up';
    } catch {
      return 'down';
    }
  }

  private async checkRedis() {
    try {
      if (this.redis.status === 'wait') {
        await this.redis.connect();
      }

      await this.redis.ping();
      return 'up';
    } catch {
      return 'down';
    }
  }
}
