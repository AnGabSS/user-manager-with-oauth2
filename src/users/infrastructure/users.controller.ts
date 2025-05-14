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
} from '@nestjs/common'
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

  @Post()
  async create(@Body() createUserDto: SignupDTO) {
    return this.signupUseCase.execute(createUserDto)
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() loginUserDTO: SigninDTO) {
    const output = await this.signinUseCase.execute(loginUserDTO)
    return this.authService.generateJwt(output.id)
  }

  @Get()
  async findAll(@Query() query: ListUsersDTO) {
    return this.listUsersUseCase.execute(query)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getUserUseCase.execute({ id: id })
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.updateUserUseCase.execute({ id: id, ...updateUserDto })
  }

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
