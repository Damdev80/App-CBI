import { Module } from '@nestjs/common';
import { TeachersServiceService } from './teachers-service.service';
import { TeachersServiceController } from './teachers-service.controller';

@Module({
  providers: [TeachersServiceService],
  controllers: [TeachersServiceController],
})
export class TeachersServiceModule {}
