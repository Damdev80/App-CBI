import { Body, Controller, Post, Put, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginSchema, LoginDto } from 'src/schemas/login.schema';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { RegisterDto, registerSchema } from 'src/schemas/register.schema';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/log-in')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async logIn(@Body() loginData: LoginDto) {
    return await this.authService.signIn(loginData.email, loginData.password);
  }

  @Post('/register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() registerData: RegisterDto){
    return await this.authService.register(registerData.name, registerData.email, registerData.password);
  }

  
}
