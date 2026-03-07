import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationGateway } from './notification.gateway';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockGateway = {
    sendNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationGateway, useValue: mockGateway },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an empty array', () => {
      const result = controller.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('markAsRead', () => {
    it('should return success response', () => {
      const result = controller.markAsRead('5');

      expect(result).toEqual({ success: true });
    });
  });
});
