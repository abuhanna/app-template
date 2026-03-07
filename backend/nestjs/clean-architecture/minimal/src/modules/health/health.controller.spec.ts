import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DataSource } from 'typeorm';

describe('HealthController', () => {
  let controller: HealthController;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DataSource,
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return healthy status', () => {
      const result = controller.health();

      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('application', 'AppTemplate API');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return a valid ISO timestamp', () => {
      const result = controller.health();
      const timestamp = new Date(result.timestamp);

      expect(timestamp.toISOString()).toBe(result.timestamp);
    });
  });

  describe('ready', () => {
    it('should return ready status when database is connected', async () => {
      (dataSource.query as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.ready();

      expect(result).toHaveProperty('status', 'ready');
      expect(result).toHaveProperty('database', 'connected');
      expect(result).toHaveProperty('timestamp');
      expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should throw SERVICE_UNAVAILABLE when database is disconnected', async () => {
      (dataSource.query as jest.Mock).mockRejectedValue(
        new Error('Connection refused'),
      );

      try {
        await controller.ready();
        fail('Expected HttpException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(
          HttpStatus.SERVICE_UNAVAILABLE,
        );
        const response = (error as HttpException).getResponse();
        expect(response).toHaveProperty('status', 'not ready');
        expect(response).toHaveProperty('database', 'disconnected');
      }
    });
  });

  describe('live', () => {
    it('should return alive status', () => {
      const result = controller.live();

      expect(result).toHaveProperty('status', 'alive');
      expect(result).toHaveProperty('timestamp');
    });

    it('should return a valid ISO timestamp', () => {
      const result = controller.live();
      const timestamp = new Date(result.timestamp);

      expect(timestamp.toISOString()).toBe(result.timestamp);
    });
  });
});
