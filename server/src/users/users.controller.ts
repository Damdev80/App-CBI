import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { IUser } from './intefaces/user.interfaces';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { createUserSchema } from 'src/schemas/create-user.schema';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/users')
  async getUsers(): Promise<IUser[]> {
    return await this.usersService.findAll();
  }
  
  @Get('/users/:id')
  async getUserId(@Param('id') id: string): Promise<IUser | null> {
    return await this.usersService.findId(id);
  }

  @Post('/users')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() body): Promise<IUser> {
    return await this.usersService.create(body);
  }

  @Patch('/users/:id/deactivate')
  async desativateUser(@Param('id') id: string): Promise<IUser> {
    return await this.usersService.deactivateUser(id);
  }
}
