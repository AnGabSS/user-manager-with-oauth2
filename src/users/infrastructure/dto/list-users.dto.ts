import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contract'
import { ListUsersUseCase } from '@/users/application/usecases/listusers.usecase'

export class ListUsersDTO implements ListUsersUseCase.Input {
  page?: number
  perPage?: number
  sort?: string
  sortDir?: SortDirection
  filter?: string
}
