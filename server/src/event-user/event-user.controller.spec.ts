import { Test, TestingModule } from '@nestjs/testing';
import { EventUserController } from './event-user.controller';

describe('EventUserController', () => {
  let controller: EventUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventUserController],
    }).compile();

    controller = module.get<EventUserController>(EventUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
