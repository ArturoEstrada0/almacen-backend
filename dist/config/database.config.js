"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConfig = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
let DatabaseConfig = class DatabaseConfig {
    createTypeOrmOptions() {
        const usePostgres = !!process.env.DB_HOST || !!process.env.DATABASE_URL;
        if (usePostgres) {
            if (process.env.DATABASE_URL) {
                return {
                    type: 'postgres',
                    url: process.env.DATABASE_URL,
                    ssl: process.env.NODE_ENV === 'production' || process.env.DB_FORCE_SSL ? { rejectUnauthorized: false } : false,
                    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                    synchronize: process.env.NODE_ENV !== 'production',
                    logging: process.env.NODE_ENV === 'development',
                };
            }
            return {
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: Number(process.env.DB_PORT) || 5432,
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_DATABASE || 'almacen',
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                synchronize: process.env.NODE_ENV !== 'production',
                logging: process.env.NODE_ENV === 'development',
            };
        }
        const dataDir = (0, path_1.join)(__dirname, '../../data');
        if (!(0, fs_1.existsSync)(dataDir))
            (0, fs_1.mkdirSync)(dataDir, { recursive: true });
        const sqliteFile = (0, path_1.join)(dataDir, 'dev.sqlite');
        return {
            type: 'sqlite',
            database: sqliteFile,
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
        };
    }
};
exports.DatabaseConfig = DatabaseConfig;
exports.DatabaseConfig = DatabaseConfig = __decorate([
    (0, common_1.Injectable)()
], DatabaseConfig);
//# sourceMappingURL=database.config.js.map