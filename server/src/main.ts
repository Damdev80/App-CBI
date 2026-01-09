import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:4200', 'https://app-cbi.onrender.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',

  });
  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
