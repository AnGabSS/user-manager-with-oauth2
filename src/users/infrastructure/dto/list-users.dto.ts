import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contract'
import { ListUsersUseCase } from '@/users/application/usecases/listusers.usecase'
import { UserRole } from '@prisma/client'
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

export class ListUsersDTO implements ListUsersUseCase.Input {
  @IsString()
  @IsOptional()
  page?: number
  @IsString()
  @IsOptional()
  perPage?: number
  @IsString()
  @IsOptional()
  sort?: string
  @IsString()
  @IsOptional()
  sortDir?: SortDirection
  @IsString()
  @IsOptional()
  filter?: string
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole
}
