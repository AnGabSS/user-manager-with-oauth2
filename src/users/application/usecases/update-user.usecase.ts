import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserOutput, UserOutputMapper } from '../dtos/user-output'

export namespace UpdateUserUseCase {
  export type Input = {
    id: string
    name: string
    email: string
  }

  export type Output = UserOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private userRepository: UserRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      if (!input.name) {
        throw new BadRequestError('Name not provided')
      }
      const entity = await this.userRepository.findById(input.id)
      if (entity.email !== input.email) {
        await this.userRepository.emailExists(input.email)
      }
      entity.updateName(input.name)
      entity.updateEmail(input.email)
      await this.userRepository.update(entity)
      return UserOutputMapper.toOutput(entity)
    }
  }
}
