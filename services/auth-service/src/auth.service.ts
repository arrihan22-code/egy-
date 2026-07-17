import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from './prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(params: { phone: string; email?: string; password: string; fullName?: string }) {
    const { phone, email, password, fullName } = params;

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
    });
    if (existing) throw new ConflictException('User with this phone or email already exists');

    if (password.length < 6) throw new Error('Password must be at least 6 characters');

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        phone,
        email,
        passwordHash,
        profiles: fullName ? { create: { fullName } } : undefined,
      },
      include: { profiles: true },
    });

    const tokens = await this.generateTokens(user.id, user.phone);

    return {
      success: true,
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }

  async login(phoneOrEmail: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: phoneOrEmail },
          ...(phoneOrEmail.includes('@') ? [{ email: phoneOrEmail }] : []),
        ],
      },
      include: { roles: { include: { role: true } }, profiles: true },
    });

    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.phone);
    return {
      success: true,
      data: {
        user: this.sanitizeUser(user),
        ...tokens,
      },
    };
  }

  async refresh(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { roles: { include: { role: true } }, profiles: true } } },
    });

    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.generateTokens(tokenRecord.userId, tokenRecord.user.phone);
    return {
      success: true,
      data: {
        user: this.sanitizeUser(tokenRecord.user),
        ...tokens,
      },
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, token: refreshToken, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { success: true, message: 'Logged out' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } }, profiles: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    return { success: true, data: this.sanitizeUser(user) };
  }

  async updateProfile(userId: string, params: { fullName?: string; avatarUrl?: string; dateOfBirth?: string; gender?: string; language?: string }) {
    const updateData: any = {};
    if (params.fullName !== undefined) updateData.fullName = params.fullName;
    if (params.avatarUrl !== undefined) updateData.avatarUrl = params.avatarUrl;
    if (params.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(params.dateOfBirth);
    if (params.gender !== undefined) updateData.gender = params.gender;
    if (params.language !== undefined) updateData.language = params.language;

    const profile = await this.prisma.profile.upsert({
      where: { userId },
      create: { userId, ...updateData },
      update: updateData,
    });

    return { success: true, data: profile };
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');

    if (newPassword.length < 6) throw new Error('Password must be at least 6 characters');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    return { success: true, message: 'Password updated' };
  }

  async adminListUsers(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: { roles: { include: { role: true } }, profiles: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      success: true,
      data: records.map(u => this.sanitizeUser(u)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminUpdateUser(userId: string, params: { isVerified?: boolean; roles?: string[] }) {
    const updateData: any = {};
    if (params.isVerified !== undefined) updateData.isVerified = params.isVerified;

    if (params.roles) {
      await this.prisma.userRole.deleteMany({ where: { userId } });
      for (const roleName of params.roles) {
        let role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role) role = await this.prisma.role.create({ data: { name: roleName, permissions: [] } });
        await this.prisma.userRole.create({ data: { userId, roleId: role.id } });
      }
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.user.update({ where: { id: userId }, data: updateData });
    }

    return this.getMe(userId);
  }

  private async generateTokens(userId: string, phone: string) {
    const payload = { sub: userId, phone };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'jwt-secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshTokenValue = crypto.randomUUID();
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshTokenValue,
        expiresAt: refreshTokenExpires,
      },
    });

    return { accessToken, refreshToken: refreshTokenValue, expiresIn: 900 };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return {
      ...rest,
      roles: user.roles?.map((ur: any) => ur.role?.name || ur.role) || [],
      profile: user.profiles?.[0] || user.profile || null,
    };
  }
}
