import { Test, TestingModule } from '@nestjs/testing';
import { UsersServiceController } from './users-service.controller';

describe('UsersServiceController', () => {
  let controller: UsersServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersServiceController],
    }).compile();

    controller = module.get<UsersServiceController>(UsersServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
