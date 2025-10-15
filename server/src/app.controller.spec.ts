import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // provide a mock request with a user to satisfy JwtGuard/usages
      const mockReq: any = { user: { id: 1 } };
      expect(appController.getHello(mockReq)).toBe('Hello World!');
    });
  });
});
