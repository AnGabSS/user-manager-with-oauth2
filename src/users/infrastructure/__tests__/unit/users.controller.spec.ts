import { UserOutput } from '@/users/application/dtos/user-output'
import { GetUserUseCase } from '@/users/application/usecases/getuser.usecase'
import { SignupUseCase } from '@/users/application/usecases/signup.usecase'
import { UpdatePasswordUseCase } from '@/users/application/usecases/update-password.usecase'
import { UpdateUserUseCase } from '@/users/application/usecases/update-user.usecase'
import { UserRole } from '@/users/domain/entities/user-role.enum'
import { SigninDTO } from '../../dto/signin.dto'
import { SignupDTO } from '../../dto/signup.dto'
import { UpdatePasswordDTO } from '../../dto/update-password.dto'
import { UpdateUserDto } from '../../dto/update-user.dto'
import { UsersController } from '../../users.controller'

describe('UsersController unit tests', () => {
  let sut: UsersController
  let id: string
  let props: UserOutput

  beforeEach(async () => {
    sut = new UsersController()
    id = '04b487da-5e7a-40bd-99e6-ff1583183b4c'
    props = {
      id,
      name: 'David bowie',
      email: 'david@bowie.com',
      password: '1234',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: null,
    }
  })

  it('should create a user', async () => {
    const output: SignupUseCase.Output = props
    const mockSignupUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['signupUseCase'] = mockSignupUseCase as any
    const input: SignupDTO = {
      name: 'David bowie',
      email: 'david@bowie.com',
      password: '1234',
      role: UserRole.ADMIN,
    }
    const result = await sut.create(input)
    expect(output).toStrictEqual(result)
    expect(mockSignupUseCase.execute).toHaveBeenCalledWith(input)
  })

  it('should authenticate a user', async () => {
    const output = 'fake_token'
    const mockSigninUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    const mockAuthService = {
      generateJwt: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['signinUseCase'] = mockSigninUseCase as any
    sut['authService'] = mockAuthService as any
    const input: SigninDTO = {
      email: 'a@a.com',
      password: '1234',
    }
    const result = await sut.login(input)
    expect(result).toEqual(output)
    expect(mockSigninUseCase.execute).toHaveBeenCalledWith(input)
  })

  it('should update a user', async () => {
    const output: UpdateUserUseCase.Output = props
    const mockUpdateUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['updateUserUseCase'] = mockUpdateUserUseCase as any
    const input: UpdateUserDto = {
      name: 'new name',
    }
    const presenter = await sut.update(id, input)
    expect(presenter).toMatchObject(output)
    expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({ id, ...input })
  })

  it('should update a users password', async () => {
    const output: UpdatePasswordUseCase.Output = props
    const mockUpdatePasswordUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['updatePasswordUseCase'] = mockUpdatePasswordUseCase as any
    const input: UpdatePasswordDTO = {
      password: 'new password',
      oldPassword: 'old password',
    }
    const presenter = await sut.UpdatePassword(id, input)
    expect(presenter).toMatchObject(output)
    expect(mockUpdatePasswordUseCase.execute).toHaveBeenCalledWith({
      id,
      ...input,
    })
  })

  it('should delete a user', async () => {
    const output = undefined
    const mockDeleteUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['deleteUserUseCase'] = mockDeleteUserUseCase as any
    const result = await sut.remove(id)
    expect(output).toStrictEqual(result)
    expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith({
      id,
    })
  })

  it('should gets a user', async () => {
    const output: GetUserUseCase.Output = props
    const mockGetUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['getUserUseCase'] = mockGetUserUseCase as any
    const presenter = await sut.findOne(id)
    expect(presenter).toMatchObject(output)
    expect(mockGetUserUseCase.execute).toHaveBeenCalledWith({
      id,
    })
  })
})
