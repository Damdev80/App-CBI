import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  providers: [MembersService],
  controllers: [MembersController]
})
export class MembersModule {}
