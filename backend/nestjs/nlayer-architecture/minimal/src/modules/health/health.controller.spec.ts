import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DataSource } from 'typeorm';

describe('HealthController', () => {
  let controller: HealthController;

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return healthy status', () => {
      const result = controller.health();

      expect(result.status).toBe('healthy');
      expect(result.application).toBe('AppTemplate API');
    });
  });

  describe('ready', () => {
    it('should return ready when database is connected', async () => {
      mockDataSource.query.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.ready();

      expect(result.status).toBe('ready');
      expect(result.database).toBe('connected');
    });

    it('should throw when database is disconnected', async () => {
      mockDataSource.query.mockRejectedValue(new Error('Connection refused'));

      await expect(controller.ready()).rejects.toThrow(HttpException);
    });
  });

  describe('live', () => {
    it('should return alive status', () => {
      const result = controller.live();

      expect(result.status).toBe('alive');
    });
  });
});
