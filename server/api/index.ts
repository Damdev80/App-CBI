import 'tsconfig-paths/register';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import type { Request, Response } from 'express';

let cachedServer: INestApplication | null = null;

async function bootstrap() {
  if (!cachedServer) {
    const expressAdapter = new ExpressAdapter();
    
    cachedServer = await NestFactory.create(
      AppModule,
      expressAdapter,
      {
        logger: ['error', 'warn', 'log'],
      }
    );

    cachedServer.enableCors({
      origin: true,
      credentials: true,
    });

    await cachedServer.init();
  }
  
  return cachedServer;
}

export default async (req: Request, res: Response) => {
  try {
    const app = await bootstrap();
    const expressApp = app.getHttpAdapter().getInstance();
    return expressApp(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
