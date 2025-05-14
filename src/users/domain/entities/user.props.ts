import { UserRole } from './user-role.enum'

export type UserProps = {
  name: string
  email: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt?: Date,
  lastLoginAt?: Date
}
