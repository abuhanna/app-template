import { Test, TestingModule } from '@nestjs/testing';
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

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      await controller.ready(mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ready', database: 'connected' }),
      );
    });

    it('should return 503 when database is disconnected', async () => {
      mockDataSource.query.mockRejectedValue(new Error('Connection refused'));

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      await controller.ready(mockResponse as any);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'not ready', database: 'disconnected' }),
      );
    });
  });

  describe('live', () => {
    it('should return alive status', () => {
      const result = controller.live();

      expect(result.status).toBe('alive');
    });
  });
});
