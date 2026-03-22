import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/** Añade connection_limit a la URL para evitar agotar el pool (Neon, Supabase, etc.) */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) return url ?? '';
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has('connection_limit')) return url;
    parsed.searchParams.set('connection_limit', '1');
    return parsed.toString();
  } catch {
    return url.includes('?') ? `${url}&connection_limit=1` : `${url}?connection_limit=1`;
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: {
        db: {
          url: getDatabaseUrl(),
        },
      },
      log: ['error', 'warn'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: any) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  async cleanUp() {
    if (process.env.NODE_ENV === 'production') {
      await this.$disconnect();
    }
  }
}