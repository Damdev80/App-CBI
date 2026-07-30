import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { IncomingMessage, ServerResponse } from 'http';
import { AppModule } from '../src/app.module';

const server = express();

let app: Awaited<ReturnType<typeof NestFactory.create>> | null = null;

async function bootstrap() {
  if (app) return app;

  app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4200',
      'https://iglesiacbi-sincelejo.vercel.app',
      'https://app-cbi-api.vercel.app',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.init();
  return app;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  await bootstrap();
  server(req, res);
}
