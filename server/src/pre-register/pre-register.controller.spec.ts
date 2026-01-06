import { Test, TestingModule } from '@nestjs/testing';
import { PreRegisterController } from './pre-register.controller';

describe('PreRegisterController', () => {
  let controller: PreRegisterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreRegisterController],
    }).compile();

    controller = module.get<PreRegisterController>(PreRegisterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
