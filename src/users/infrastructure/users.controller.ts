import { AuthGuard } from '@/auth/infrastructure/auth/auth.guard'
import { AuthService } from '@/auth/infrastructure/auth/auth.service'
import { SignupUseCase } from '@/users/application/usecases/signup.usecase'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { DeleteUserUseCase } from '../application/usecases/delete-user.usecase'
import { GetUserUseCase } from '../application/usecases/getuser.usecase'
import { ListUsersUseCase } from '../application/usecases/listusers.usecase'
import { SigninUseCase } from '../application/usecases/signin.usecase'
import { UpdatePasswordUseCase } from '../application/usecases/update-password.usecase'
import { UpdateUserUseCase } from '../application/usecases/update-user.usecase'
import { ListUsersDTO } from './dto/list-users.dto'
import { SigninDTO } from './dto/signin.dto'
import { SignupDTO } from './dto/signup.dto'
import { UpdatePasswordDTO } from './dto/update-password.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserPresenter } from './presenters/user.presenter'

@Controller('/users')
export class UsersController {
  @Inject(SignupUseCase.UseCase)
  private signupUseCase: SignupUseCase.UseCase

  @Inject(SigninUseCase.UseCase)
  private signinUseCase: SigninUseCase.UseCase

  @Inject(UpdateUserUseCase.UseCase)
  private updateUserUseCase: UpdateUserUseCase.UseCase

  @Inject(UpdatePasswordUseCase.UseCase)
  private updatePasswordUseCase: UpdatePasswordUseCase.UseCase

  @Inject(DeleteUserUseCase.UseCase)
  private deleteUserUseCase: DeleteUserUseCase.UseCase

  @Inject(GetUserUseCase.UseCase)
  private getUserUseCase: GetUserUseCase.UseCase

  @Inject(ListUsersUseCase.UseCase)
  private listUsersUseCase: ListUsersUseCase.UseCase

  @Inject(AuthService)
  private authService: AuthService

  @ApiResponse({
    status: 409,
    description: 'Conflito de e-mail',
  })
  @ApiResponse({
    status: 422,
    description: 'Corpo da requisição com dados inválidos',
  })
  @Post()
  async create(@Body() createUserDto: SignupDTO) {
    return this.signupUseCase.execute(createUserDto)
  }

  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Corpo da requisição com dados inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'E-mail não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Credenciais inválidas',
  })
  @HttpCode(200)
  @Post('login')
  async login(@Body() signinDto: SigninDTO) {
    const output = await this.signinUseCase.execute(signinDto)
    return this.authService.generateToken(output.id)
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        meta: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
            },
            currentPage: {
              type: 'number',
            },
            lastPage: {
              type: 'number',
            },
            perPage: {
              type: 'number',
            },
          },
        },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(UserPresenter) },
        },
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Parâmetros de consulta inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado',
  })
  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Query() query: ListUsersDTO) {
    return this.listUsersUseCase.execute(query)
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 404,
    description: 'Id não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado',
  })
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getUserUseCase.execute({ id: id })
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 422,
    description: 'Corpo da requisição com dados inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Id não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado',
  })
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.updateUserUseCase.execute({ id: id, ...updateUserDto })
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 422,
    description: 'Corpo da requisição com dados inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Id não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado',
  })
  @UseGuards(AuthGuard)
  @Patch(':id')
  async UpdatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDTO: UpdatePasswordDTO,
  ) {
    return this.updatePasswordUseCase.execute({ id: id, ...updatePasswordDTO })
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.deleteUserUseCase.execute({ id })
  }
}
