import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express, { Request, Response } from 'express';
import { INestApplication } from '@nestjs/common';

const expressApp: express.Express = express();

let cachedApp: INestApplication;

async function createNestServer(expressInstance: express.Express) {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressInstance),
      { logger: ['error', 'warn', 'log'] }
    );

    app.enableCors({
      origin: ['http://localhost:4200', 'https://your-frontend-domain.vercel.app'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    });

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

// Initialize the app on cold start
createNestServer(expressApp)
  .then(() => console.log('Nest Ready'))
  .catch((err) => console.error('Nest broken', err));

// Export the Express app for Vercel
export default expressApp;
