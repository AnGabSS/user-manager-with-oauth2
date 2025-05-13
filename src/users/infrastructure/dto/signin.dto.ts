import { SigninUseCase } from '@/users/application/usecases/signin.usecase'

export class SigninDTO implements SigninUseCase.Input {
  email: string
  password: string
}
