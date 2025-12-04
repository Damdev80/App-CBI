import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersEventService, CreateUsersEventDto, UpdateUsersEventDto, AddPaymentDto } from './users-event.service';

@Controller('users-event')
export class UsersEventController {
  constructor(private readonly usersEventService: UsersEventService) {}

  @Post('create')
  create(@Body() createDto: CreateUsersEventDto) {
    return this.usersEventService.create(createDto);
  }

  @Get()
  findAll() {
    return this.usersEventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersEventService.findOne(id);
  }

  @Get(':id/payment-info')
  getPaymentInfo(@Param('id') id: string) {
    return this.usersEventService.getPaymentInfo(id);
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.usersEventService.findByEvent(eventId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateUsersEventDto) {
    return this.usersEventService.update(id, updateDto);
  }

  @Patch(':id/add-payment')
  addPayment(@Param('id') id: string, @Body() paymentDto: AddPaymentDto) {
    return this.usersEventService.addPayment(id, paymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersEventService.remove(id);
  }
}
