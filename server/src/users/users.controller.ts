import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { UsersService, CreateUserDto } from './users.service';
import { User } from '@prisma/client';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { createUserSchema } from 'src/schemas/create-user.schema';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/users')
  async getUsers(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Get('/users/:id')
  async getUserId(@Param('id') id: string): Promise<User | null> {
    return await this.usersService.findById(id);
  }

  @Post('/users')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(
    @Body() body: CreateUserDto,
  ): Promise<User> {
    return await this.usersService.create(body);
  }

  @Patch('/users/:id/deactivate')
  async desativateUser(@Param('id') id: string): Promise<User> {
    return await this.usersService.deactivateUser(id);
  }
}
