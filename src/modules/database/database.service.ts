import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool?: Pool;

  constructor(private readonly config: ConfigService) {
    const connectionString = this.config.get<string>('DATABASE_URL');
    if (!connectionString) {
      this.logger.warn(
        'DATABASE_URL is not configured; road intelligence services will use JSON fallback storage.',
      );
      return;
    }

    this.pool = new Pool({
      connectionString,
      ssl: this.config.get<string>('DATABASE_SSL') === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }

  get isEnabled() {
    return Boolean(this.pool);
  }

  async query<T = any>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database is not configured');
    }
    return this.pool.query<T>(sql, params);
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }
}
