import { Entity } from '@/shared/domain/entities/entity'
import { UserRole } from './user-role.enum'
import { UserProps } from './user.props'

export class UserEntity extends Entity<UserProps> {
  constructor(
    public readonly props: UserProps,
    id?: string,
  ) {
    super(props, id)
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this.props.name
  }

  private set name(newName: string) {
    this.props.name = newName
  }

  get email(): string {
    return this.props.email
  }

  private set email(newEmail: string) {
    this.props.email = newEmail
  }

  get password(): string {
    return this.props.password
  }

  get role(): UserRole {
    return this.props.role
  }

  private set role(newRole: UserRole) {
    this.props.role = newRole
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  private set updatedAt(newUpdatedAt: Date) {
    this.props.updatedAt = newUpdatedAt
  }

  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt
  }

  private set lastLoginAt(newLastLoginAt: Date){
    this.props.lastLoginAt = newLastLoginAt
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new Error('Invalid name.')
    }
    this.props.name = newName
    this.updateDate()
  }

  updateEmail(newEmail: string): void {
    if (!newEmail.includes('@')) {
      throw new Error('Invalid email.')
    }
    this.props.email = newEmail
    this.updateDate()
  }

  updatePassword(newPassword: string): void {
    if (newPassword.length < 6) {
      throw new Error('Password too short.')
    }
    this.props.password = newPassword
    this.updateDate()
  }

  changeRole(role: UserRole): void {
    this.props.role = role
    this.updateDate()
  }

  private updateDate(): void {
    this.props.updatedAt = new Date()
  }

   updateLastLoginAt(): void{
    this.props.lastLoginAt = new Date()
  }

  toPrimitives(): UserProps {
    return {
      name: this.props.name,
      email: this.props.email,
      password: this.props.password,
      role: this.props.role,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      lastLoginAt: this.props.lastLoginAt,
    }
  }
}
