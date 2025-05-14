import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'
import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { GoogleStrategy } from './strategies/google.strategy'

@Module({
  imports: [
    EnvConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [EnvConfigModule.forRoot()],
      useFactory: (configService: EnvConfigService) => ({
        global: true,
        secret: configService.getJwtSecret(),
        signOptions: { expiresIn: configService.getJwtExpiresIn() },
      }),
      inject: [EnvConfigService],
    }),
  ],
  providers: [AuthService, GoogleStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
