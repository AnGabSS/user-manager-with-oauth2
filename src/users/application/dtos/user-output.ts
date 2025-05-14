import { UserRole } from '@/users/domain/entities/user-role.enum'
import { UserEntity } from '@/users/domain/entities/user.entity'

export type UserOutput = {
  id: string
  name: string
  email: string
  role: UserRole
  password: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date
}

export class UserOutputMapper {
  static toOutput(entity: UserEntity): UserOutput {
    return entity.toJSON()
  }
}
