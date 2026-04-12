import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRootInfo() {
    return {
      ok: true,
      app: 'App CBI API',
      message: 'Backend activo',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.0.1',
      routes: {
        auth: '/auth',
        events: '/event/events',
        users: '/user/users',
      },
    };
  }
}
