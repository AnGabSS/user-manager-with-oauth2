import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { GoogleUser } from './interfaces/google-user.interface'

type JwtPayload = {
  sub: string
  id: string
  role: string
}

type TokenResponse = {
  accessToken: string
  expiresIn: number
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: EnvConfigService,
  ) {}

  async generateToken(userId: string, role: string): Promise<TokenResponse> {
    const payload: JwtPayload = { sub: userId, id: userId, role:  role}

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getJwtSecret(),
      expiresIn: this.configService.getJwtExpiresIn(),
    })

    return {
      accessToken,
      expiresIn: this.configService.getJwtExpiresIn(),
    }
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getJwtSecret(),
      })
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado')
    }
  }

  private parseExpiresIn(expiresIn: string): number {
    if (!expiresIn) return 3600
    const unit = expiresIn.slice(-1)
    const value = parseInt(expiresIn.slice(0, -1))

    switch (unit) {
      case 's':
        return value // segundos
      case 'm':
        return value * 60 // minutos
      case 'h':
        return value * 3600 // horas
      case 'd':
        return value * 86400 // dias
      default:
        return 3600 // Default 1h
    }
  }

  async googleLogin(req: GoogleUser) {
    console.log(req)
    if (!req.email) {
      return 'Nenhum usuário do Google encontrado';
    }

    const payload = {
      email: req.email,
      name: req.name,
      picture: req.picture,
      accessToken: req.accessToken
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Login com Google bem-sucedido',
      user: req.email,
      access_token: token,
    };
  }
}
