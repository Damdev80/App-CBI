import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateVisitorDto, VisitorsService } from './visitors.service';

@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Post()
  create(@Body() data: CreateVisitorDto) {
    return this.visitorsService.create(data);
  }

  @Get()
  findAll() {
    return this.visitorsService.findAll();
  }
}
