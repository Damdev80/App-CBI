import { Test, TestingModule } from '@nestjs/testing';
import { UsersEventService } from './users-event.service';

describe('UsersEventService', () => {
  let service: UsersEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersEventService],
    }).compile();

    service = module.get<UsersEventService>(UsersEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
