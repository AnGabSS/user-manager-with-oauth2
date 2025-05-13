// src/shared/infrastructure/env-config/env-config.module.ts
import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config'
import { join } from 'node:path'
import { EnvConfigService } from './env-config.service'

@Module({})
export class EnvConfigModule {
  static forRoot(options: ConfigModuleOptions = {}): DynamicModule {
    return {
      module: EnvConfigModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: [
            join(__dirname, `../../../../.env.${process.env.NODE_ENV}`),
          ],
          ...options,
        }),
      ],
      providers: [EnvConfigService],
      exports: [EnvConfigService],
    }
  }
}
