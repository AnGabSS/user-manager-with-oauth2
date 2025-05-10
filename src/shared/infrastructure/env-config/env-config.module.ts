import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { join } from 'node:path';
import { EnvConfigService } from './env-config.service';

@Module({
  providers: [EnvConfigService],
})
export class EnvConfigModule extends ConfigModule {
  static async forRoot(
    options: ConfigModuleOptions = {},
  ): Promise<DynamicModule> {
    const module = await super.forRoot({
      ...options,
      envFilePath: [
        join(__dirname, `../../../../.env.${process.env.NODE_ENV}`),
      ],
    });
    return module;
  }
}
