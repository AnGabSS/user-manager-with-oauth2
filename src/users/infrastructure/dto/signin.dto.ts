import { SigninUseCase } from '@/users/application/usecases/signin.usecase'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsEmail } from 'class-validator'

export class SigninDTO implements SigninUseCase.Input {
  @ApiProperty({ description: 'E-mail do usuário' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({ description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty()
  password: string
}
