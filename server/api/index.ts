import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';

const expressApp: express.Express = express();
const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.enableCors({
    origin: ['http://localhost:4200', 'https://your-frontend-domain.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  });

  return app.init();
};

createNestServer(expressApp)
  .then(() => console.log('Nest Ready'))
  .catch((err) => console.error('Nest broken', err));

export default expressApp;
