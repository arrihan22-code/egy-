import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockUser = {
    id: 'user-1',
    phone: '+201234567890',
    email: 'test@example.com',
    passwordHash: '$2a$12$hashed',
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [],
    profiles: [{ fullName: 'Test User' }],
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      profile: { upsert: jest.fn() },
      userRole: { deleteMany: jest.fn(), create: jest.fn() },
      role: { findUnique: jest.fn(), create: jest.fn() },
    };
    jwtService = { sign: jest.fn().mockReturnValue('mock-access-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$12$hashed');
      prisma.user.create.mockResolvedValue(mockUser);
      prisma.refreshToken.create.mockResolvedValue({ token: 'mock-refresh' });

      const result = await service.register({ phone: '+201234567890', password: 'password123', fullName: 'Test User' });
      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('mock-access-token');
    });

    it('should throw ConflictException for duplicate phone', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      await expect(service.register({ phone: '+201234567890', password: 'password123' })).rejects.toThrow(ConflictException);
    });

    it('should throw for short password', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.register({ phone: '+201234567890', password: '123' })).rejects.toThrow('Password must be at least 6 characters');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.refreshToken.create.mockResolvedValue({ token: 'mock-refresh' });

      const result = await service.login('+201234567890', 'password123');
      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('mock-access-token');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login('+201234567890', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login('+201234567890', 'password')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('should return user data', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.getMe('user-1');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('user-1');
    });

    it('should throw for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getMe('invalid')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('adminListUsers', () => {
    it('should return paginated users', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      prisma.user.count.mockResolvedValue(1);
      const result = await service.adminListUsers(1, 50);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});