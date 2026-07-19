import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './database/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  const prismaMock = {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    jest.clearAllMocks();
  });

  describe('getApiInfo', () => {
    it('should return API information', () => {
      expect(appController.getApiInfo()).toEqual({
        name: 'Siparİş API',
        status: 'running',
        version: '0.1.0',
      });
    });
  });

  describe('healthCheck', () => {
    it('should return database health status', async () => {
      const result = await appController.healthCheck();

      expect(prismaMock.$queryRaw).toHaveBeenCalled();
      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
      expect(result.timestamp).toEqual(expect.any(String));
    });
  });
});
