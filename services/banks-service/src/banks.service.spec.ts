import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BanksService } from './banks.service';
import { PrismaService } from './prisma.service';

describe('BanksService', () => {
  let service: BanksService;
  let prisma: any;

  const mockBank = {
    id: 'bank-1',
    nameAr: 'بنك مصر',
    nameEn: 'Banque Misr',
    code: 'BMISR',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    branches: [],
  };

  beforeEach(async () => {
    prisma = {
      bank: { findMany: jest.fn(), findUnique: jest.fn(), count: jest.fn() },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BanksService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BanksService>(BanksService);
  });

  describe('findAll', () => {
    it('should return paginated banks', async () => {
      prisma.bank.findMany.mockResolvedValue([mockBank]);
      prisma.bank.count.mockResolvedValue(1);
      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should apply search filter', async () => {
      prisma.bank.findMany.mockResolvedValue([]);
      prisma.bank.count.mockResolvedValue(0);
      await service.findAll({ page: 1, limit: 20, search: 'مصر' });
      expect(prisma.bank.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ nameAr: { contains: 'مصر' } }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a bank by id', async () => {
      prisma.bank.findUnique.mockResolvedValue(mockBank);
      const result = await service.findOne('bank-1');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('bank-1');
    });

    it('should throw NotFoundException for missing bank', async () => {
      prisma.bank.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});