import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { applyGlobalConfig } from './global-config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

    app.enableCors({
      origin: '*',
      credentials: false,
    });

    const config = new DocumentBuilder()
    .setTitle('User Manager API')
    .setDescription(
      'A simple user manager api with create,read,update,delete and authentication endpoints',
    )
    .setVersion('1.0.0')
    .addBearerAuth({
      description: 'Infomar o JWT para autorizar o acesso',
      name: 'Authorization',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header',
    })
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger-ui.html', app, document)

  applyGlobalConfig(app)
  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
console.log(
  `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
)
