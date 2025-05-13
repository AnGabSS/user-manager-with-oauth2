import { SignupUseCase } from '@/users/application/usecases/signup.usecase'
import { UserRole } from '@/users/domain/entities/user-role.enum'

export class SignupDTO implements SignupUseCase.Input {
  name: string
  email: string
  password: string
  role: UserRole
}
