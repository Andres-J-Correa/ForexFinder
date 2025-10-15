import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: { login: jest.Mock; validateGoogleUser: jest.Mock };

  beforeEach(async () => {
    const loginMock = jest.fn();
    loginMock.mockResolvedValue({ accessToken: 'a', refreshToken: 'r' });

    const validateGoogleUserMock = jest.fn();

    mockAuthService = {
      login: loginMock,
      validateGoogleUser: validateGoogleUserMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('refresh', () => {
    it('throws UnauthorizedException when no user in request', async () => {
      await expect(
        controller.refresh({} as unknown as Request),
      ).rejects.toThrow('Invalid refresh token');
    });

    it('calls authService.login and returns tokens when user present', async () => {
      const req = { user: { sub: 42 } } as unknown as Request;
      const tokens = await controller.refresh(req);
      expect(mockAuthService.login).toHaveBeenCalledWith(42);
      expect(tokens).toEqual({ accessToken: 'a', refreshToken: 'r' });
    });
  });

  describe('googleLogin', () => {
    it('is defined and returns undefined (handled by guard/strategy)', () => {
      expect(controller.googleLogin()).toBeUndefined();
    });
  });

  describe('googleCallback', () => {
    it('calls authService.login with user id and returns tokens', async () => {
      const req = { user: 7 } as unknown as Request;
      const tokens = await controller.googleCallback(req);
      expect(mockAuthService.login).toHaveBeenCalledWith(7);
      expect(tokens).toEqual({ accessToken: 'a', refreshToken: 'r' });
    });

    it('propagates errors from authService.login', async () => {
      mockAuthService.login.mockRejectedValueOnce(new Error('fail'));
      await expect(
        controller.googleCallback({ user: 7 } as unknown as Request),
      ).rejects.toThrow('fail');
    });
  });
});
