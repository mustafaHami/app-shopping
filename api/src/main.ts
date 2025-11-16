import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: errors => {
        const messages = errors.map(error => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));
        logger.error('Validation failed:', JSON.stringify(messages, null, 2));
        return new BadRequestException({ message: 'Validation failed', errors: messages });
      },
    }),
  );

  app.enableCors({
    origin: ['http://localhost:19006', 'http://localhost:8081', '*'],
  });

  logger.log('Started on port:', process.env.PORT ?? 3000);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
