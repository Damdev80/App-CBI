import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { UsersServiceService } from './users-service.service';

@Controller('users-service')
export class UsersServiceController {
  constructor(private readonly usersServiceService: UsersServiceService) {}

  @Post()
  create(
    @Body() body: { 
      name: string; 
      number?: string; 
      teacherIds: string[];
      Gender: 'MASCULINO' | 'FEMENINO';
      Documents?: string;
      groupId?: string;
    },
  ) {
    return this.usersServiceService.create(body);
  }

  @Get()
  findAll() {
    return this.usersServiceService.findAll();
  }

  @Get('teacher/:teacherId')
  findByTeacher(@Param('teacherId') teacherId: string) {
    return this.usersServiceService.findByTeacher(teacherId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersServiceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      number?: string;
      GoToCampement?: boolean;
      payGotoCampement?: 'PAGO' | 'DEBE';
      Gender?: 'MASCULINO' | 'FEMENINO';
      Documents?: string;
      groupId?: string | null;
      teacherIds?: string[];
    },
  ) {
    return this.usersServiceService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersServiceService.delete(id);
  }
}