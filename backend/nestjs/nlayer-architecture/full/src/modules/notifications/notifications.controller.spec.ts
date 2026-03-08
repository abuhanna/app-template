import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '../../services/notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockService = {
    findAllByUser: jest.fn(),
    getUnreadCount: jest.fn(),
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
    it('should return paginated notifications for user', async () => {
      const paginated = {
        data: [{ id: 1, title: 'Test', isRead: false }],
        pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false },
      };
      mockService.findAllByUser.mockResolvedValue(paginated);

      const result = await controller.findAll(
        { user: { userId: 1 } },
        { page: 1, pageSize: 10, sortOrder: 'desc' as const },
      );

      expect(mockService.findAllByUser).toHaveBeenCalled();
      expect(result).toEqual(paginated);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount({ user: { userId: 1 } });

      expect(result).toEqual({ count: 5 });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockService.markAsRead.mockResolvedValue(undefined);

      await controller.markAsRead(1, { user: { userId: 1 } });

      expect(mockService.markAsRead).toHaveBeenCalledWith(1, 1);
    });
  });
});
