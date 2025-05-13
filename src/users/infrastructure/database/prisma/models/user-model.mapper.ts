import { ValidationError } from '@/shared/domain/errors/validation-error'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserRole } from '@/users/domain/entities/user-role.enum'
import {User} from '@prisma/client'

export class UserModelMapper {
  static toEntity(model: User) {
    const data = {
      name: model.name,
      email: model.email,
      password: model.password,
      role: UserRole[model.role as keyof typeof UserRole], // 👈 conversão explícita
      createdAt: model.createdAt,
      updatedAt: model.updatedAt
    }

    try {
      return new UserEntity(data, model.id)
    } catch {
      throw new ValidationError('An entity could not be loaded')
    }
  }
}
