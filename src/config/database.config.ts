import { Injectable } from "@nestjs/common"
import type { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm"
import { existsSync, mkdirSync } from "fs"
import { join } from "path"

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    // If POSTGRES env vars are present, prefer Postgres, otherwise use SQLite file for local dev
    const usePostgres = !!process.env.DB_HOST || !!process.env.DATABASE_URL

    if (usePostgres) {
      // If a full DATABASE_URL is provided (e.g. from Supabase), use it.
      if (process.env.DATABASE_URL) {
        return {
          type: 'postgres',
          url: process.env.DATABASE_URL,
          // Ensure SSL is used in production environments (useful for managed Postgres like Supabase)
          ssl: process.env.NODE_ENV === 'production' || process.env.DB_FORCE_SSL ? { rejectUnauthorized: false } : false,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: process.env.NODE_ENV !== 'production',
          logging: process.env.NODE_ENV === 'development',
        }
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
      }
    }

    // Ensure data directory exists
    const dataDir = join(__dirname, '../../data')
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })

    const sqliteFile = join(dataDir, 'dev.sqlite')
    return {
      type: 'sqlite',
      database: sqliteFile,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }
  }
}
