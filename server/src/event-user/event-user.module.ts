import { Module } from '@nestjs/common';
import { EventUserService } from './event-user.service';
import { EventUserController } from './event-user.controller';

@Module({
  providers: [EventUserService],
  controllers: [EventUserController]
})
export class EventUserModule {}
