import 'tsconfig-paths/register';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedServer: INestApplication | null = null;

async function bootstrap() {
  if (!cachedServer) {
    console.log('Initializing NestJS application...');
    
    const adapter = new ExpressAdapter();
    
    cachedServer = await NestFactory.create(AppModule, adapter, {
      logger: ['error', 'warn'],
      abortOnError: false,
    });

    cachedServer.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    await cachedServer.init();
    console.log('NestJS application initialized successfully');
  }
  
  return cachedServer;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await bootstrap();
    const server = app.getHttpAdapter().getInstance();
    
    return server(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
