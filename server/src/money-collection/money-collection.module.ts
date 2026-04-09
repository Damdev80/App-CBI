import { Module } from '@nestjs/common';
import { MoneyCollectionController } from './money-collection.controller';
import { MoneyCollectionService } from './money-collection.service';
import { MoneyCollectionInvoiceService } from './money-collection-invoice.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MoneyCollectionController],
  providers: [MoneyCollectionService, MoneyCollectionInvoiceService],
  exports: [MoneyCollectionService],
})
export class MoneyCollectionModule {}
