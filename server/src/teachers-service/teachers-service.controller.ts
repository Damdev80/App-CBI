import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { TeachersServiceService } from './teachers-service.service';

@Controller('teachers-service')
export class TeachersServiceController {
  constructor(
    private readonly teachersService: TeachersServiceService,
  ) {}

  @Post()
  create(
    @Body() body: { name: string; number?: string },
  ) {
    return this.teachersService.create(body);
  }

  @Get()
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; number?: string; GoToCampement?: boolean },
  ) {
    return this.teachersService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.teachersService.delete(id);
  }
}
