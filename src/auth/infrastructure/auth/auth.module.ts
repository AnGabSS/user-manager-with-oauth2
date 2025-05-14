import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'
import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service'

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [EnvConfigModule], // Importa o módulo que fornece EnvConfigService
      useFactory: (configService: EnvConfigService) => ({
        global: true,
        secret: configService.getJwtSecret(),
        signOptions: { expiresIn: configService.getJwtExpiresIn() },
      }),
      inject: [EnvConfigService],
    }),
  ],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
