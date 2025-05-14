import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { applyGlobalConfig } from './global-config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  applyGlobalConfig(app)
  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
console.log(
  `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
)
