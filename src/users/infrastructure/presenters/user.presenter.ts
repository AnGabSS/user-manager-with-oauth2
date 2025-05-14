import { CollectionPresenter } from '@/shared/infrastructure/presenters/collection.presenter'
import { UserOutput } from '@/users/application/dtos/user-output'
import { ListUsersUseCase } from '@/users/application/usecases/listusers.usecase'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class UserPresenter {
  @ApiProperty({ description: 'Identificação do usuário' })
  id: string

  @ApiProperty({ description: 'Nome do usuário' })
  name: string

  @ApiProperty({ description: 'E-mail do usuário' })
  email: string

  @ApiProperty({ description: 'Cargo do usuário' })
  role: string

  @ApiProperty({ description: 'Data de criação do usuário' })
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date

  @ApiProperty({ description: 'Data da ultima atualização do usuário' })
  @Transform(({ value }: { value: Date }) => value.toISOString())
  updateAt: Date

  @ApiProperty({ description: 'Data da ultima entrada do usuário' })
  @Transform(({ value }: { value: Date }) => value.toISOString())
  lastLoginAt: Date

  constructor(output: UserOutput) {
    this.id = output.id
    this.name = output.name
    this.email = output.email
    this.role = output.role
    this.createdAt = output.createdAt
    this.updateAt = output.updatedAt
    this.lastLoginAt = output.lastLoginAt
  }
}

export class UserCollectionPresenter extends CollectionPresenter {
  data: UserPresenter[]

  constructor(output: ListUsersUseCase.Output) {
    const { items, ...paginationProps } = output
    super(paginationProps)
    this.data = items.map(item => new UserPresenter(item))
  }
}
