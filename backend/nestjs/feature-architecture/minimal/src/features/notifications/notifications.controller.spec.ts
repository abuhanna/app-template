import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationGateway } from './notification.gateway';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let gateway: NotificationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationGateway,
          useValue: {
            sendNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    gateway = module.get<NotificationGateway>(NotificationGateway);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an empty array', () => {
      const result = controller.getAll();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('markAsRead', () => {
    it('should return success response', () => {
      const result = controller.markAsRead('1');

      expect(result).toEqual({ success: true });
    });

    it('should accept any notification id as string', () => {
      const result = controller.markAsRead('42');

      expect(result).toEqual({ success: true });
    });
  });
});
