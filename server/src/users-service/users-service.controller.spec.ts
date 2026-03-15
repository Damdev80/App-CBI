import { Test, TestingModule } from '@nestjs/testing';
import { UsersServiceController } from './users-service.controller';
import { UsersServiceService } from './users-service.service';

const mockUsersServiceService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByTeacher: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  toggleAttendance: jest.fn(),
  delete: jest.fn(),
};

describe('UsersServiceController', () => {
  let controller: UsersServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersServiceController],
      providers: [
        { provide: UsersServiceService, useValue: mockUsersServiceService },
      ],
    }).compile();

    controller = module.get<UsersServiceController>(UsersServiceController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
