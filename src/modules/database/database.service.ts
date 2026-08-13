import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
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

  async onModuleInit() {
    if (!this.pool) return;
    try {
      const migrationPath = join(process.cwd(), 'db', 'migrations', '001_realtime_road_intelligence.sql');
      const sql = await fs.readFile(migrationPath, 'utf8');
      await this.pool.query(sql);
      this.logger.log('Database migrations applied successfully.');
    } catch (error: any) {
      this.logger.warn(`Migration skipped or partially applied: ${error?.message}`);
    }
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
