import { Test, TestingModule } from '@nestjs/testing';
import { UsersEventController } from './users-event.controller';
import { UsersEventService } from './users-event.service';

describe('UsersEventController', () => {
  let controller: UsersEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersEventController],
      providers: [UsersEventService],
    }).compile();

    controller = module.get<UsersEventController>(UsersEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
