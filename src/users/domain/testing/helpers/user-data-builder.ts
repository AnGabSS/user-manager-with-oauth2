import { faker } from '@faker-js/faker/.';
import { UserRole } from '../../entities/user-role.enum';
import { UserProps } from '../../entities/user.props';

export function UserDataBuilder(props: Partial<UserProps>): UserProps {
  return {
    name: props.name ?? faker.person.fullName(),
    email: props.email ?? faker.internet.email(),
    password: props.password ?? faker.internet.password(),
    role: props.role ?? UserRole.USER,
    createdAt: props.createdAt ?? new Date(),
    updatedAt: props.updatedAt ?? new Date(),
  };
}
