import { Controller, Get, Post, Put, Param, Query, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { phone: string; email?: string; password: string; fullName?: string }) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { phoneOrEmail: string; password: string }) {
    return this.authService.login(body.phoneOrEmail, body.password);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  async logout(@Headers('x-user-id') userId: string, @Body('refreshToken') refreshToken?: string) {
    if (!userId) throw new UnauthorizedException('User ID required');
    return this.authService.logout(userId, refreshToken);
  }

  @Get('me')
  async getMe(@Headers('x-user-id') userId: string) {
    if (!userId) throw new UnauthorizedException('Not authenticated');
    return this.authService.getMe(userId);
  }

  @Put('profile')
  async updateProfile(@Headers('x-user-id') userId: string, @Body() body: any) {
    if (!userId) throw new UnauthorizedException('Not authenticated');
    return this.authService.updateProfile(userId, body);
  }

  @Put('password')
  async updatePassword(@Headers('x-user-id') userId: string, @Body() body: { currentPassword: string; newPassword: string }) {
    if (!userId) throw new UnauthorizedException('Not authenticated');
    return this.authService.updatePassword(userId, body.currentPassword, body.newPassword);
  }

  @Get('admin/users')
  async adminListUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.authService.adminListUsers(page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
  }

  @Put('admin/users/:id')
  async adminUpdateUser(@Param('id') id: string, @Body() body: { isVerified?: boolean; roles?: string[] }) {
    return this.authService.adminUpdateUser(id, body);
  }
}
