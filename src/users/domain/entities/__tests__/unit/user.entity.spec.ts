import { UserDataBuilder } from '../../../testing/helpers/user-data-builder';
import { UserRole } from '../../user-role.enum';
import { UserEntity } from '../../user.entity';
import { UserProps } from '../../user.props';

describe('UserEntity unit tests', () => {
  let props: UserProps;
  let sut: UserEntity;

  beforeEach(() => {
    props = UserDataBuilder({});

    sut = new UserEntity(props);
  });

  it('should create a user with correct properties', () => {
    expect(sut.name).toBe(props.name);
    expect(sut.email).toBe(props.email);
    expect(sut.password).toBe(props.password);
    expect(sut.role).toBe(props.role);
    expect(sut.createdAt).toBeInstanceOf(Date);
    expect(sut.updatedAt).toBeInstanceOf(Date);
  });

  it('should update name and change updatedAt', () => {
    const oldUpdatedAt = sut.updatedAt;
    const newName = 'New Name';

    sut.updateName(newName);

    expect(sut.name).toBe(newName);
    expect(sut.updatedAt.getTime()).toBeGreaterThanOrEqual(
      oldUpdatedAt.getTime(),
    );
  });

  it('should throw error when updating name with invalid value', () => {
    expect(() => sut.updateName('')).toThrow('Invalid name.');
  });

  it('should update email', () => {
    const newEmail = 'test@example.com';
    sut.updateEmail(newEmail);
    expect(sut.email).toBe(newEmail);
  });

  it('should throw error with invalid email', () => {
    expect(() => sut.updateEmail('invalid')).toThrow('Invalid email.');
  });

  it('should update password', () => {
    const newPassword = 'securePass123';
    sut.updatePassword(newPassword);
    expect(sut.password).toBe(newPassword);
  });

  it('should throw error when password is too short', () => {
    expect(() => sut.updatePassword('123')).toThrow('Password too short.');
  });

  it('should change role', () => {
    sut.changeRole(UserRole.ADMIN);
    expect(sut.role).toBe(UserRole.ADMIN);
  });

  it('should convert entity to primitives', () => {
    const primitives = sut.toPrimitives();
    expect(primitives).toEqual(expect.objectContaining(props));
  });
});
