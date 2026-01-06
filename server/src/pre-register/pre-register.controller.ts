import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { PreRegisterService, PreRegisterUserDto } from './pre-register.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { preRegisterSchema } from 'src/schemas/pre-register.schema';

@Controller('pre-register')
export class PreRegisterController {
    constructor(private readonly preRegisterService: PreRegisterService) {}
    
    @Post()
    @UsePipes(new ZodValidationPipe(preRegisterSchema))
    async preRegisterUser(@Body() data: PreRegisterUserDto) {
        return await this.preRegisterService.preRegisterUser(data);
    }
}
