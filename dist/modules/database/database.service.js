"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(DatabaseService_1.name);
        const connectionString = this.config.get('DATABASE_URL');
        if (!connectionString) {
            this.logger.warn('DATABASE_URL is not configured; road intelligence services will use JSON fallback storage.');
            return;
        }
        this.pool = new pg_1.Pool({
            connectionString,
            ssl: this.config.get('DATABASE_SSL') === 'true'
                ? { rejectUnauthorized: false }
                : undefined,
        });
    }
    get isEnabled() {
        return Boolean(this.pool);
    }
    async query(sql, params = []) {
        if (!this.pool) {
            throw new Error('Database is not configured');
        }
        return this.pool.query(sql, params);
    }
    async onModuleDestroy() {
        await this.pool?.end();
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseService);
//# sourceMappingURL=database.service.js.map