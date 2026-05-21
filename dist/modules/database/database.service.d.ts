import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryResult } from 'pg';
export declare class DatabaseService implements OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private readonly pool?;
    constructor(config: ConfigService);
    get isEnabled(): boolean;
    query<T = any>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
    onModuleDestroy(): Promise<void>;
}
