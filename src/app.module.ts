import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from './auth/infrastructure/auth/auth.module'
import { DatabaseModule } from './shared/infrastructure/database/database.module'
import { EnvConfigModule } from './shared/infrastructure/env-config/env-config.module'
import { UsersModule } from './users/infrastructure/users.module'

@Module({
  imports: [
    EnvConfigModule.forRoot(),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    DatabaseModule,
  ],
})
export class AppModule {}
