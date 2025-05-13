import { HashProvider } from '@/shared/application/providers/hash-provider'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { UserRole } from '@/users/domain/entities/user-role.enum'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { BadRequestError } from '../../../shared/application/errors/bad-request-error'
import { UserOutput, UserOutputMapper } from '../dtos/user-output'

export namespace SignupUseCase {
  export type Input = {
    name: string
    email: string
    password: string
    role: UserRole
  }

  export type Output = UserOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private userRepository: UserRepository.Repository,
      private hashProvider: HashProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const { email, name, password, role } = input

      if (!email || !name || !password || !role) {
        throw new BadRequestError('Input data not provided')
      }

      await this.userRepository.emailExists(email)

      const hashPassword = await this.hashProvider.generateHash(password)

      const entity = new UserEntity({
        name: input.name,
        email: input.email,
        password: hashPassword,
        role: input.role,
        createdAt: new Date()
      })

      await this.userRepository.insert(entity)
      return UserOutputMapper.toOutput(entity)
    }
  }
}
