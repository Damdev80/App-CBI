import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginSchema, LoginDto } from 'src/schemas/login.schema';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/log-in')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async logIn(@Body() loginData: LoginDto) {
    return await this.authService.logIn(loginData.email, loginData.password);
  }
}
