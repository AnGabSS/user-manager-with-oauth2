import { SignupUseCase } from '@/users/application/usecases/signup.usecase'
import { UserRole } from '@/users/domain/entities/user-role.enum'
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class SignupDTO implements SignupUseCase.Input {
  @ApiProperty({ description: 'Nome do usuário' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'E-mail do usuário' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({ description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty()
  password: string

  @ApiProperty({ description: 'Perfil do usuário' })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole
}
