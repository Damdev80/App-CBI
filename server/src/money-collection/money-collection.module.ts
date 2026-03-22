import { Module } from '@nestjs/common';
import { MoneyCollectionController } from './money-collection.controller';
import { MoneyCollectionService } from './money-collection.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MoneyCollectionController],
  providers: [MoneyCollectionService],
  exports: [MoneyCollectionService],
})
export class MoneyCollectionModule {}
