import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class AuthService {
    constructor(private PrismaService:PrismaService){}

    async login(){
        //Logica de validacion

        return await this.PrismaService.user
    }

    async register(){
        //Logica de validacion
        
        return await this.PrismaService.user
    }
}
