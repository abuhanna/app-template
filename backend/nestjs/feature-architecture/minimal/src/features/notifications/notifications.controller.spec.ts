import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockNotification = {
    id: 1,
    userId: 1,
    title: 'Test',
    message: 'Test message',
    type: 'info',
    isRead: false,
    readAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResult = {
    data: [mockNotification],
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockPaginatedResult),
            getUnreadCount: jest.fn().mockResolvedValue({ count: 1 }),
            markAsRead: jest.fn().mockResolvedValue(undefined),
            markAllAsRead: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated notifications for the user', async () => {
      const query = { page: 1, pageSize: 10 };
      const result = await controller.findAll(
        { user: { userId: 1 } },
        query as any,
        undefined,
      );
      expect(service.findAll).toHaveBeenCalledWith(1, query, undefined);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      await controller.markAsRead(1, { user: { userId: 1 } });
      expect(service.markAsRead).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      await controller.delete(1, { user: { userId: 1 } });
      expect(service.delete).toHaveBeenCalledWith(1, 1);
    });
  });
});
