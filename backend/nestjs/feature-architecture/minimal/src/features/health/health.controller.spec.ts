import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheckResult } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let typeOrmHealthIndicator: TypeOrmHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              status: 'ok',
              details: {
                database: { status: 'up' },
              },
            } as HealthCheckResult),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    typeOrmHealthIndicator = module.get<TypeOrmHealthIndicator>(TypeOrmHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health check result', async () => {
      const result = await controller.check();

      expect(result).toEqual({
        status: 'ok',
        details: {
          database: { status: 'up' },
        },
      });
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should invoke the database ping check', async () => {
      await controller.check();

      const checkCallArg = (healthCheckService.check as jest.Mock).mock.calls[0][0];
      expect(checkCallArg).toHaveLength(1);

      // Execute the indicator function passed to check() to verify it calls pingCheck
      await checkCallArg[0]();
      expect(typeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith('database');
    });
  });
});
