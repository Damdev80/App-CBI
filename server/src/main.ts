import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('Connected to the database successfully');
  } catch (error) {
    console.error('Error connecting to the database', error);
    return;
  }
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
