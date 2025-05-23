import { Injectable } from '@nestjs/common'
import { EnvConfig } from './env.config.interface'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class EnvConfigService implements EnvConfig {
  constructor(private configService: ConfigService) {}
  getGoogleClientId(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_ID')
  }
  getGoogleClientSecret(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_SECRET')
  }
  getGoogleCallbackURL(): string {
    return this.configService.get<string>('GOOGLE_CALLBACK_URL')
  }

  getAppPort(): number {
    return Number(this.configService.get<number>('PORT'))
  }

  getNodeEnv(): string {
    return this.configService.get<string>('NODE_ENV')
  }

  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET')
  }

  getJwtExpiresIn(): number {
    return Number(this.configService.get<number>('JWT_EXPIRES_IN'))
  }
}
