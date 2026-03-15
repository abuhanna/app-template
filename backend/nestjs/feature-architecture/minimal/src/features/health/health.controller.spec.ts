import { Test, TestingModule } from '@nestjs/testing';
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
            query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
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
      expect(result.status).toBe('healthy');
    });
  });

  describe('ready', () => {
    it('should return ready status when database is connected', async () => {
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
      (dataSource.query as jest.Mock).mockRejectedValue(new Error('Connection failed'));

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
