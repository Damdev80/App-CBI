import {
  BadRequestException,
  StreamableFile,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { MoneyCollectionService } from './money-collection.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('money-collections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoneyCollectionController {
  constructor(private readonly moneyCollection: MoneyCollectionService) {}

  @Roles(Role.ADMIN, Role.SEMI_ADMIN, Role.CONTADORA)
  @Post()
  create(
    @Body()
    body: {
      date: string;
      amount: number;
      studentId: string;
      notes?: string;
      targetAmount?: number;
    },
    @Req()
    req: { user?: { name?: string; email?: string } },
  ) {
    return this.moneyCollection.create(body, {
      issuerName:
        req.user?.name?.trim() || req.user?.email?.trim() || process.env.ACCOUNTANT_NAME || 'Contadora CBI',
    });
  }

  @Roles(Role.ADMIN, Role.SEMI_ADMIN, Role.CONTADORA, Role.LIDER_GRUPO)
  @Get()
  findAll(
    @Query('studentId') studentId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('groupId') groupId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.moneyCollection.findAll({ studentId, teacherId, from, to, groupId });
  }

  @Roles(Role.ADMIN, Role.SEMI_ADMIN, Role.CONTADORA, Role.LIDER_GRUPO)
  @Get(':id/invoice')
  async getInvoice(
    @Param('id') id: string,
    @Req()
    req: { user?: { name?: string; email?: string } },
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const invoice = await this.moneyCollection.getInvoice(
      id,
      req.user?.name?.trim() || req.user?.email?.trim() || process.env.ACCOUNTANT_NAME || 'Contadora CBI',
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.fileName}"`,
      'X-Invoice-Number': invoice.invoiceNumber,
    });

    return new StreamableFile(invoice.buffer);
  }

  @Roles(Role.ADMIN, Role.SEMI_ADMIN, Role.CONTADORA, Role.LIDER_GRUPO)
  @Get('total')
  getTotal(
    @Query('studentId') studentId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('groupId') groupId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.moneyCollection.getTotal({ studentId, teacherId, from, to, groupId });
  }

  @Roles(Role.ADMIN, Role.SEMI_ADMIN, Role.CONTADORA, Role.LIDER_GRUPO)
  @Get('debt-status')
  getDebtStatus(
    @Query('expectedAmount') expectedAmount?: string,
    @Query('studentId') studentId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('groupId') groupId?: string,
  ) {
    const parsedExpectedAmount = this.parseExpectedAmount(expectedAmount);
    return this.moneyCollection.getDebtStatus({
      expectedAmount: parsedExpectedAmount,
      studentId,
      teacherId,
      groupId,
    });
  }

  @Roles(Role.ADMIN, Role.SEMI_ADMIN, Role.CONTADORA, Role.LIDER_GRUPO)
  @Get('morosos')
  getMorosos(
    @Query('expectedAmount') expectedAmount?: string,
    @Query('teacherId') teacherId?: string,
    @Query('groupId') groupId?: string,
  ) {
    const parsedExpectedAmount = this.parseExpectedAmount(expectedAmount);
    return this.moneyCollection.getMorosos({
      expectedAmount: parsedExpectedAmount,
      teacherId,
      groupId,
    });
  }

  @Roles(Role.ADMIN, Role.SEMI_ADMIN, Role.CONTADORA)
  @Post('recalculate-pay-status')
  recalculatePayStatus(
    @Body()
    body: {
      expectedAmount: number;
      studentId?: string;
      teacherId?: string;
      groupId?: string;
    },
  ) {
    const parsedExpectedAmount = this.parseExpectedAmount(body.expectedAmount);

    return this.moneyCollection.recalculatePayStatusForStudents({
      ...body,
      expectedAmount: parsedExpectedAmount,
    });
  }

  private parseExpectedAmount(value: unknown): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new BadRequestException('expectedAmount debe ser un numero mayor a 0.');
    }

    return Math.round(parsed);
  }
}
