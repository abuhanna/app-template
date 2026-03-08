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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            findAllByUser: jest.fn().mockResolvedValue([mockNotification]),
            findOne: jest.fn().mockResolvedValue(mockNotification),
            markAsRead: jest.fn().mockResolvedValue({ ...mockNotification, isRead: true }),
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
    it('should return notifications for the user', async () => {
      const result = await controller.findAll({ user: { userId: 1 } });
      expect(service.findAllByUser).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockNotification]);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const result = await controller.markAsRead(1, { user: { userId: 1 } });
      expect(service.markAsRead).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual({ message: 'Notification marked as read' });
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      await controller.delete(1, { user: { userId: 1 } });
      expect(service.delete).toHaveBeenCalledWith(1, 1);
    });
  });
});
