import { Module } from '@nestjs/common';
import { StudentGroupsController } from './student-groups.controller';
import { StudentGroupsService } from './student-groups.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudentGroupsController],
  providers: [StudentGroupsService],
  exports: [StudentGroupsService],
})
export class StudentGroupsModule {}
