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
      expect(result.application).toBe('AppTemplate API');
    });
  });

  describe('ready', () => {
    it('should return ready status when database is connected', async () => {
      const result = await controller.ready();
      expect(result.status).toBe('ready');
      expect(result.database).toBe('connected');
    });

    it('should throw when database is disconnected', async () => {
      (dataSource.query as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(controller.ready()).rejects.toThrow();
    });
  });

  describe('live', () => {
    it('should return alive status', () => {
      const result = controller.live();
      expect(result.status).toBe('alive');
    });
  });
});
