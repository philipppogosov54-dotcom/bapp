import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    prismaService = app.get(PrismaService);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('getHealth', () => {
    it('should return health status', async () => {
      const result = await appController.getHealth();
      
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(typeof result.uptime).toBe('number');
    });
  });

  describe('getDetailedHealth', () => {
    it('should return detailed health with db status ok', async () => {
      const result = await appController.getDetailedHealth();
      
      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result.services.database.status).toBe('ok');
      expect(result.services.api.status).toBe('ok');
      expect(result).toHaveProperty('memory');
    });

    it('should return degraded status when db fails', async () => {
      prismaService.$queryRaw.mockRejectedValueOnce(new Error('DB connection failed'));
      
      const result = await appController.getDetailedHealth();
      
      expect(result.status).toBe('degraded');
      expect(result.services.database.status).toBe('error');
    });
  });
});
