import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import jwtRefreshConfig from './config/jwt-refresh.config';
import { UsersService } from '@/users/users.service';

// mock argon2 functions to allow safe mocking in tests
jest.mock('argon2', () => ({ hash: jest.fn(), verify: jest.fn() }));
import * as argon2 from 'argon2';
import { UserCreateDto } from '@/users/dto/user-create.dto';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    signAsync: jest.fn().mockImplementation((payload, opts) => {
      if (opts) return Promise.resolve('refreshToken');
      return Promise.resolve('accessToken');
    }),
  };

  const mockUsersService = {
    updateHashedRefreshToken: jest.fn().mockResolvedValue(undefined),
    getHashedRefreshToken: jest.fn().mockResolvedValue('hashed'),
    getUserIdByEmail: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(5),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        { provide: (jwtRefreshConfig as any).KEY, useValue: {} },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokens', () => {
    it('returns access and refresh tokens', async () => {
      const tokens = await service.generateTokens(1);
      expect(tokens).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('throws UnauthorizedException when jwtService fails', async () => {
      mockJwtService.signAsync.mockRejectedValueOnce(new Error('jwt fail'));
      await expect(service.generateTokens(1)).rejects.toThrow(
        'Failed to generate tokens',
      );
    });
  });

  describe('login', () => {
    it('hashes refresh token, updates user and returns tokens', async () => {
      const spyHash = jest
        .spyOn(argon2, 'hash')
        .mockResolvedValueOnce('hashedToken');
      const tokens = await service.login(1);
      expect(tokens).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      expect(spyHash).toHaveBeenCalledWith('refreshToken');
      expect(mockUsersService.updateHashedRefreshToken).toHaveBeenCalledWith(
        1,
        'hashedToken',
      );
      spyHash.mockRestore();
    });

    it('throws UnauthorizedException when hashing fails', async () => {
      jest.spyOn(argon2, 'hash').mockRejectedValueOnce(new Error('hash fail'));
      await expect(service.login(1)).rejects.toThrow('Failed to login');
    });
  });

  describe('validateGoogleUser', () => {
    it('returns existing user id when found', async () => {
      mockUsersService.getUserIdByEmail.mockResolvedValueOnce(10);
      const id = await service.validateGoogleUser({} as UserCreateDto);
      expect(id).toBe(10);
    });

    it('creates a new user when not found', async () => {
      mockUsersService.getUserIdByEmail.mockResolvedValueOnce(null);
      mockUsersService.create.mockResolvedValueOnce(20);
      const id = await service.validateGoogleUser({} as UserCreateDto);
      expect(id).toBe(20);
    });
  });

  describe('validateRefreshToken', () => {
    it('returns true when token matches', async () => {
      mockUsersService.getHashedRefreshToken.mockResolvedValueOnce('hashed');
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(true);
      await expect(service.validateRefreshToken(1, 'rt')).resolves.toBe(true);
    });

    it('throws UnauthorizedException when no hashed token found', async () => {
      mockUsersService.getHashedRefreshToken.mockResolvedValueOnce(null);
      await expect(service.validateRefreshToken(1, 'rt')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('throws UnauthorizedException when verify throws', async () => {
      mockUsersService.getHashedRefreshToken.mockResolvedValueOnce('h');
      jest.spyOn(argon2, 'verify').mockRejectedValueOnce(new Error('bad'));
      await expect(service.validateRefreshToken(1, 'rt')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('throws UnauthorizedException when token does not match', async () => {
      mockUsersService.getHashedRefreshToken.mockResolvedValueOnce('h');
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(false);
      await expect(service.validateRefreshToken(1, 'rt')).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });
});
