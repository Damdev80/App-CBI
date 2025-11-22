import { Module } from '@nestjs/common';
import { UsersEventService } from './users-event.service';
import { UsersEventController } from './users-event.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersEventController],
  providers: [UsersEventService],
  exports: [UsersEventService],
})
export class UsersEventModule {}
