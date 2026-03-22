import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { StudentGroupsService } from './student-groups.service';

@Controller('student-groups')
export class StudentGroupsController {
  constructor(private readonly studentGroups: StudentGroupsService) {}

  @Post()
  create(
    @Body() body: { name: string; number?: string; teacherId?: string },
  ) {
    return this.studentGroups.create(body);
  }

  @Get()
  findAll(@Query('teacherId') teacherId?: string) {
    return this.studentGroups.findAll(teacherId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentGroups.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; number?: string; teacherId?: string },
  ) {
    return this.studentGroups.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.studentGroups.delete(id);
  }
}
