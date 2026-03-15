import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersServiceService } from './users-service.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  userServiceSocial: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersServiceService', () => {
  let service: UsersServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersServiceService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersServiceService>(UsersServiceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const data = {
        name: 'Juan',
        number: '1234567890',
        teacherId: 'teacher-id',
        Gender: 'MASCULINO' as const,
        Documents: 'DNI',
      };
      const expectedResult = { id: 'user-id', ...data, School: {} };
      mockPrismaService.userServiceSocial.create.mockResolvedValue(expectedResult);

      const result = await service.create(data);
      expect(result).toEqual(expectedResult);
    });

    it('should throw ConflictException when number already exists', async () => {
      const data = {
        name: 'Juan',
        number: '1234567890',
        teacherId: 'teacher-id',
        Gender: 'MASCULINO' as const,
      };
      mockPrismaService.userServiceSocial.create.mockRejectedValue({
        code: 'P2002',
      });

      await expect(service.create(data)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.userServiceSocial.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
