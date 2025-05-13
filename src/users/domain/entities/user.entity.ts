import { Entity } from '@/shared/domain/entities/entity'
import { UserRole } from './user-role.enum'
import { UserProps } from './user.props'

export class UserEntity extends Entity<UserProps> {
  private _name: string
  private _email: string
  private _password: string
  private _role: UserRole
  private readonly _createdAt: Date
  private _updatedAt: Date

  constructor(
    public readonly props: UserProps,
    id?: string,
  ) {
    super(props, id)
    this._name = props.name
    this._email = props.email
    this._password = props.password
    this._role = props.role
    this._createdAt = props.createdAt ?? new Date()
    this._updatedAt = props.updatedAt ?? new Date()
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  private set name(newName: string) {
    this.props.name = newName
  }

  get email(): string {
    return this._email
  }

  private set email(newEmail: string) {
    this.props.email = newEmail
  }

  get password(): string {
    return this._password
  }

  get role(): UserRole {
    return this._role
  }

  private set role(newRole: UserRole) {
    this.props.role = newRole
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  private set updatedAt(newUpdatedAt: Date) {
    this.props.updatedAt = newUpdatedAt
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new Error('Invalid name.')
    }
    this._name = newName
    this.name = newName
    this.props.name = newName
    this.updateDate()
  }

  updateEmail(newEmail: string): void {
    if (!newEmail.includes('@')) {
      throw new Error('Invalid email.')
    }
    this._email = newEmail
    this.updateDate()
  }

  updatePassword(newPassword: string): void {
    if (newPassword.length < 6) {
      throw new Error('Password too short.')
    }
    this._password = newPassword
    this.updateDate()
  }

  changeRole(role: UserRole): void {
    this._role = role
    this.updateDate()
  }

  private updateDate(): void {
    this._updatedAt = new Date()
  }

  toPrimitives(): UserProps {
    return {
      name: this._name,
      email: this._email,
      password: this._password,
      role: this._role,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    }
  }
}