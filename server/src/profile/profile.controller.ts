import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(@Req() req) {
    // req.user debe tener el id del usuario autenticado
    return this.usersService.findById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateProfile(@Req() req, @Body() body: any) {
    // Solo permite actualizar los campos enviados en body
    return this.usersService.update(req.user.id, body);
  }
}