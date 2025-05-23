import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserModelMapper } from '../models/user-model.mapper'
import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { toPrismaUserRole } from '../mappers/user-role.mapper'

export class UserPrismaRepository implements UserRepository.Repository {
  sortableFields: string[] = ['name', 'createdAt']

  constructor(private prismaService: PrismaService) {}
 
  async findByEmail(email: string): Promise<UserEntity> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      })
      return UserModelMapper.toEntity(user)
    } catch {
      throw new NotFoundError(`UserModel not found using email ${email}`)
    }
  }

  async emailExists(email: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    })
    if (user) {
      throw new ConflictError(`Email address already used`)
    }
  }

  async search(
    props: UserRepository.SearchParams,
  ): Promise<UserRepository.SearchResult> {
    const sortable = this.sortableFields?.includes(props.sort) || false
    const orderByField = sortable ? props.sort : 'createdAt'
    const orderByDir = sortable ? props.sortDir : 'desc'

    const count = await this.prismaService.user.count({
      ...(props.filter && {
        where: {
          name: {
            contains: props.filter,
            mode: 'insensitive',
          },
        },
      }),
    })

    const models = await this.prismaService.user.findMany({
        where: {
          ...(props.filter && {
          name: {
            contains: props.filter,
            mode: 'insensitive',
          },
          }),
          ...(props.role && {
            role: props.role
          })
        },
      orderBy: {
        [orderByField]: orderByDir,
      },
      skip: props.page && props.page > 0 ? (props.page - 1) * props.perPage : 1,
      take: props.perPage && props.perPage > 0 ? props.perPage : 15,
    })

    return new UserRepository.SearchResult({
      items: models.map(model => UserModelMapper.toEntity(model, true)),
      total: count,
      currentPage: props.page,
      perPage: props.perPage,
      sort: orderByField,
      sortDir: orderByDir,
      filter: props.filter,
      role: props.role
    })
  }

  async insert(entity: UserEntity): Promise<void> {
    await this.prismaService.user.create({
      data: {...entity.toJSON(), role: toPrismaUserRole(entity.role),},
    })
  }

  findById(id: string): Promise<UserEntity> {
    return this._get(id)
  }

  async findAll(): Promise<UserEntity[]> {
    const models = await this.prismaService.user.findMany()
    return models.map(model => UserModelMapper.toEntity(model))
  }

  async update(entity: UserEntity): Promise<void> {
    await this._get(entity._id)
    await this.prismaService.user.update({
      data: {...entity.toJSON(),  role: toPrismaUserRole(entity.role)},
      where: {
        id: entity._id,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this._get(id)
    await this.prismaService.user.delete({
      where: { id },
    })
  }

  protected async _get(id: string): Promise<UserEntity> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
      })
      return UserModelMapper.toEntity(user)
    } catch {
      throw new NotFoundError(`UserModel not found using ID ${id}`)
    }
  }

  async findInactivesUsers(
  props: UserRepository.SearchParams,
): Promise<UserRepository.SearchResult> {
  const sortable = this.sortableFields?.includes(props.sort) || false
  const orderByField = sortable ? props.sort : 'createdAt'
  const orderByDir = sortable ? props.sortDir : 'desc'

  const today = new Date()
  const oneMonthAgo = new Date(today.setDate(today.getDate() - 30))

  const whereClause: any = {
    lastLoginAt: {
      lt: oneMonthAgo,
    },
  }

  if (props.filter) {
    whereClause.name = {
      contains: props.filter,
      mode: 'insensitive',
    }
  }

  if (props.role) {
    whereClause.role = props.role
  }

  const count = await this.prismaService.user.count({
    where: whereClause,
  })

  const models = await this.prismaService.user.findMany({
    where: whereClause,
    orderBy: {
      [orderByField]: orderByDir,
    },
    skip: props.page && props.page > 0 ? (props.page - 1) * props.perPage : 0,
    take: props.perPage && props.perPage > 0 ? props.perPage : 15,
  })

  return new UserRepository.SearchResult({
    items: models.map(model => UserModelMapper.toEntity(model, true)),
    total: count,
    currentPage: props.page,
    perPage: props.perPage,
    sort: orderByField,
    sortDir: orderByDir,
    filter: props.filter,
    role: props.role,
  })
}


}