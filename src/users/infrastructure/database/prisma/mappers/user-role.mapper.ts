import { $Enums } from '@prisma/client'
import { UserRole as DomainUserRole } from '@/users/domain/entities/user-role.enum'

export const toPrismaUserRole = (
  role: DomainUserRole
): $Enums.UserRole => {
  return role as unknown as $Enums.UserRole
}
