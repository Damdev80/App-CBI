import { Controller, Get, Param, Post, Body, UseGuards, BadRequestException, Request } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateSessionSchema } from 'src/schemas/session.schema';
import { Request as ExpressRequest } from 'express';

interface AuthUser {
    id: string;
    role: 'USER' | 'LIDER' | 'ADMIN';
    // otros campos si los tienes en el JWT
}

interface RequestWithUser extends ExpressRequest {
    user?: AuthUser;
}
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) {}

    @Get()
    async getAllSessions() {
        return await this.sessionsService.getAllSessions();
    }

    @Get(':id')
    async getSessionById(@Param('id') id: string) {
        return await this.sessionsService.getSessionById(id);
    }

    @Get('group/:groupId')
    async getSessionsByGroupId(@Param('groupId') groupId: string, @Request() req: RequestWithUser) {
        const user = req.user;
        if (!user) {
            throw new BadRequestException('Usuario no autenticado');
        }
        // Verifica que el usuario pertenece al grupo usando el método público
        const isMember = await this.sessionsService.isUserInGroup(user.id, groupId);
        if (!isMember) {
            throw new BadRequestException('No tienes acceso a este grupo');
        }
        return await this.sessionsService.getSessionsByGroupId(groupId);
    }

    @Post()
    async createSession(@Body() data: any, @Request() req: RequestWithUser) {
        const parse = CreateSessionSchema.safeParse(data);
        if (!parse.success) {
            throw new BadRequestException(parse.error.issues);
        }

        const user = req.user;
        if (!user || (user.role !== 'LIDER' && user.role !== 'ADMIN')) {
            throw new BadRequestException('No tienes permisos para crear una sesión');
        }
        // Convierte date a Date si existe
        const sessionData = {
            ...parse.data,
            date: parse.data.date ? new Date(parse.data.date) : undefined,
        };
        return await this.sessionsService.createSession(sessionData);
    }
}