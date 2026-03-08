import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '../../services/notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockService = {
    findAllByUser: jest.fn(),
    findOne: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return notifications for user', async () => {
      const mockNotifications = [
        { id: 1, title: 'Test', userId: 1, isRead: false },
      ];
      mockService.findAllByUser.mockResolvedValue(mockNotifications);

      const result = await controller.findAll({ user: { userId: 1 } });

      expect(mockService.findAllByUser).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockService.markAsRead.mockResolvedValue({});

      const result = await controller.markAsRead(1, { user: { userId: 1 } });

      expect(mockService.markAsRead).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual({ message: 'Notification marked as read' });
    });
  });
});
