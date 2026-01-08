import 'tsconfig-paths/register';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';

let cachedServer: INestApplication | null = null;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    const expressAdapter = new ExpressAdapter(expressApp);
    
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await bootstrap();
    const expressApp = app.getHttpAdapter().getInstance();
    
    // Convertir VercelRequest/Response a formato Express
    return expressApp(req as any, res as any);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
}
