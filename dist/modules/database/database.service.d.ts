import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueryResult } from 'pg';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private readonly pool?;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    get isEnabled(): boolean;
    query<T = any>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
    onModuleDestroy(): Promise<void>;
}
