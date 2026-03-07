import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NotificationsController } from './notifications.controller';
import {
  MarkNotificationReadCommand,
  MarkAllNotificationsReadCommand,
} from '../application/commands';
import { GetNotificationsQuery } from '../application/queries';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  const mockCommandBus = {
    execute: jest.fn(),
  };

  const mockQueryBus = {
    execute: jest.fn(),
  };

  const mockUser = { sub: 1, email: 'admin@test.com', username: 'admin', role: 'Admin' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call QueryBus.execute with GetNotificationsQuery', async () => {
      const notifications = [
        { id: 1, message: 'New user created', isRead: false, userId: 1 },
        { id: 2, message: 'Department updated', isRead: true, userId: 1 },
      ];
      mockQueryBus.execute.mockResolvedValue(notifications);

      const result = await controller.findAll(mockUser as any);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetNotificationsQuery(1),
      );
      expect(result).toEqual(notifications);
    });
  });

  describe('markAsRead', () => {
    it('should call CommandBus.execute with MarkNotificationReadCommand', async () => {
      mockCommandBus.execute.mockResolvedValue(undefined);

      const result = await controller.markAsRead(mockUser as any, 5);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new MarkNotificationReadCommand(5, 1),
      );
      expect(result).toEqual({ message: 'Notification marked as read' });
    });
  });

  describe('markAllAsRead', () => {
    it('should call CommandBus.execute with MarkAllNotificationsReadCommand', async () => {
      mockCommandBus.execute.mockResolvedValue(undefined);

      const result = await controller.markAllAsRead(mockUser as any);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new MarkAllNotificationsReadCommand(1),
      );
      expect(result).toEqual({ message: 'All notifications marked as read' });
    });
  });
});
