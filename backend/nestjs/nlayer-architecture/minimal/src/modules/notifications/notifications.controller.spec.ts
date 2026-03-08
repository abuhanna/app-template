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
      const mockPaginatedResult = {
        data: [{ id: 1, title: 'Test', userId: 1, isRead: false }],
        pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false },
      };
      mockService.findAllByUser.mockResolvedValue(mockPaginatedResult);

      const query = { page: 1, pageSize: 10 } as any;
      const result = await controller.findAll(
        { user: { userId: 1 } },
        query,
        undefined,
      );

      expect(mockService.findAllByUser).toHaveBeenCalledWith(1, 1, 10, undefined, undefined, false);
      expect(result).toEqual(mockPaginatedResult);
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
