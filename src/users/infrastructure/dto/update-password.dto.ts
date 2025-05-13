import { UpdatePasswordUseCase } from '@/users/application/usecases/update-password.usecase'

export class UpdatePasswordDTO
  implements Omit<UpdatePasswordUseCase.Input, 'id'>
{
  password: string
  oldPassword: string
}
