import { Module } from '@nestjs/common';
import { UsersServiceService } from './users-service.service';
import { UsersServiceController } from './users-service.controller';

@Module({
  providers: [UsersServiceService],
  controllers: [UsersServiceController]
})
export class UsersServiceModule {}
