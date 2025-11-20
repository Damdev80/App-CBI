import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { MembersService } from './members/members.service';
import { MembersController } from './members/members.controller';
import { MembersModule } from './members/members.module';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [AuthModule, PrismaModule, UsersModule, MembersModule, GroupsModule],
  controllers: [AppController, MembersController],
  providers: [AppService, AuthService, MembersService],
})
export class AppModule {}
