import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUser } from './intefaces/user.interfaces';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async findAll(): Promise<IUser[]> {
    return this.prisma.user.findMany();
  }

  async findId(id: string): Promise<IUser | null >{
    return this.prisma.user.findUnique(
      {
        where: {id},
      }
    )
  }

  async create(data: Omit<IUser, 'id | createAt'>): Promise<IUser> {
    return this.prisma.user.create({
      data,
    })
  }

  async update(id: string, data:Partial<IUser>):Promise<IUser>{
    return this.prisma.user.update({
      where: {id},
      data,
    })
  }

  async deactivateUser(id:string):Promise<IUser>{
    return this.prisma.user.update({
      where: {id},
      data: {isActive: false}
       
    })
  }
}
