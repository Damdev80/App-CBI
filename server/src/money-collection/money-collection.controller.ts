import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { MoneyCollectionService } from './money-collection.service';

@Controller('money-collections')
export class MoneyCollectionController {
  constructor(private readonly moneyCollection: MoneyCollectionService) {}

  @Post()
  create(
    @Body()
    body: {
      date: string;
      amount: number;
      studentId: string;
      notes?: string;
    },
  ) {
    return this.moneyCollection.create(body);
  }

  @Get()
  findAll(
    @Query('studentId') studentId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.moneyCollection.findAll({ studentId, teacherId, from, to });
  }

  @Get('total')
  getTotal(
    @Query('studentId') studentId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.moneyCollection.getTotal({ studentId, teacherId, from, to });
  }
}
