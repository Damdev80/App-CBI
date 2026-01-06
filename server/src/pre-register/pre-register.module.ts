import { Module } from '@nestjs/common';
import { PreRegisterController } from './pre-register.controller';
import { PreRegisterService } from './pre-register.service';

@Module({
  controllers: [PreRegisterController],
  providers: [PreRegisterService]
})
export class PreRegisterModule {}
