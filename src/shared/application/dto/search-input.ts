import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contract'
import { UserRole } from '@prisma/client'

export type SearchInput<Filter = string> = {
  page?: number
  perPage?: number
  sort?: string | null
  sortDir?: SortDirection | null
  filter?: Filter | null,
  role?: UserRole | null
}
