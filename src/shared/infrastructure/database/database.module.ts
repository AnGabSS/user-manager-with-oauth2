import { Module } from '@nestjs/common'
import { EnvConfigModule } from '../env-config/env-config.module'
import { PrismaService } from './prisma/prisma.service'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [EnvConfigModule.forRoot()],
  providers: [ConfigService, PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
