import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('by-date')
  getByDateAndTeacher(
    @Query('date') date: string,
    @Query('teacherId') teacherId: string,
  ) {
    return this.attendanceService.getByDateAndTeacher(date, teacherId);
  }

  @Post('bulk')
  upsertBulk(
    @Body()
    body: {
      date: string;
      teacherId: string;
      records: { studentId: string; present: boolean }[];
    },
  ) {
    return this.attendanceService.upsertBulk(
      body.date,
      body.teacherId,
      body.records,
    );
  }

  @Get('summary')
  getSummary(
    @Query('date') date: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.attendanceService.getSummaryByDate(date, teacherId);
  }

  @Get('history')
  getHistory(
    @Query('teacherId') teacherId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.getSundaysHistory(teacherId, from, to);
  }

  @Get('absence-counts')
  getAbsenceCounts(@Query('teacherId') teacherId: string) {
    return this.attendanceService.getAbsenceCounts(teacherId);
  }
}
