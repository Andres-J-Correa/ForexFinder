/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import User from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserCreateDto } from './dto/user-create.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  const mockUser = new User();
  mockUser.id = 1;
  mockUser.firstName = 'fname';
  mockUser.lastName = 'lName';
  mockUser.email = 'email@email';
  mockUser.hashedRefreshToken = 'hashedToken';

  const mockedUserRepo = {
    create: jest.fn().mockImplementation((dto: UserCreateDto) => ({ ...dto })),
    save: jest
      .fn()
      .mockImplementation((entity: User) => ({ ...entity, id: 2 })),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    findOne: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockedUserRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserIdByEmail', () => {
    it('getUserIdByEmail should return userId: number, when email exists', async () => {
      const result = await service.getUserIdByEmail(mockUser.email);
      expect(result).toBe(mockUser.id);
      expect(repo.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('create should return new user id when successful', async () => {
      const dto = {
        firstName: 'a',
        lastName: 'b',
        email: 'new@e.com',
      } as UserCreateDto;
      const id = await service.create(dto);
      expect(id).toBe(2);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('create should throw InternalServerErrorException on failure', async () => {
      (repo.create as jest.Mock).mockImplementationOnce(() => {
        throw new Error('create failed');
      });
      await expect(service.create({} as UserCreateDto)).rejects.toThrow(
        'Error creating user',
      );
    });
  });

  describe('updateHashedRefreshToken', () => {
    it('should update token when affected > 0', async () => {
      (repo.update as jest.Mock).mockResolvedValueOnce({ affected: 1 });
      await expect(
        service.updateHashedRefreshToken(1, 'token'),
      ).resolves.toBeUndefined();
      expect(repo.update).toHaveBeenCalledWith(
        { id: 1 },
        { hashedRefreshToken: 'token' },
      );
    });

    it('should throw InternalServerErrorException when no rows affected', async () => {
      (repo.update as jest.Mock).mockResolvedValueOnce({ affected: 0 });
      await expect(
        service.updateHashedRefreshToken(1, 'token'),
      ).rejects.toThrow('Error updating user refresh token');
    });
  });

  describe('getHashedRefreshToken', () => {
    it('should return hashed token when found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce({
        hashedRefreshToken: 'h',
      });
      const res = await service.getHashedRefreshToken(1);
      expect(res).toBe('h');
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        select: ['hashedRefreshToken'],
      });
    });

    it('should return null when user not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce(null);
      const res = await service.getHashedRefreshToken(999);
      expect(res).toBeNull();
    });

    it('should throw InternalServerErrorException on error', async () => {
      (repo.findOne as jest.Mock).mockImplementationOnce(() => {
        throw new Error('db');
      });
      await expect(service.getHashedRefreshToken(1)).rejects.toThrow(
        'Error fetching user refresh token',
      );
    });
  });
});
