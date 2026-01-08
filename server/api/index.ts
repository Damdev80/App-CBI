import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express, { Request, Response } from 'express';
import { INestApplication } from '@nestjs/common';

const server = express();
let app: INestApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { logger: console }
    );

    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    });

    await app.init();
  }
  return server;
}

export default async (req: Request, res: Response) => {
  await bootstrap();
  server(req, res);
};
