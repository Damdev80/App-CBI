import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class AuthService {
    constructor(private prisma:PrismaService) {}

    async login(){
        //Logica de validacion

        return await this.prisma.user
    }

    async register(){
        //Logica de validacion
        
        return await this.prisma.user
    }
}
