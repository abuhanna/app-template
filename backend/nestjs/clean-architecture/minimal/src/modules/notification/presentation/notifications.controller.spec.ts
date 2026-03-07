import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NotificationsController } from './notifications.controller';
import { GetNotificationsQuery } from '../application/queries';
import {
  MarkNotificationReadCommand,
  MarkAllNotificationsReadCommand,
} from '../application/commands';

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
        {
          id: 1,
          title: 'Test notification',
          message: 'Test message',
          type: 'info',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ];
      mockQueryBus.execute.mockResolvedValue(notifications);

      const user = { sub: 1, email: 'admin@test.com', username: 'admin', role: 'Admin' };
      const result = await controller.findAll(user);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetNotificationsQuery(1),
      );
      expect(result).toEqual(notifications);
    });

    it('should return empty array when no notifications exist', async () => {
      mockQueryBus.execute.mockResolvedValue([]);

      const user = { sub: 2, email: 'user@test.com', username: 'user', role: 'User' };
      const result = await controller.findAll(user);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        new GetNotificationsQuery(2),
      );
      expect(result).toEqual([]);
    });
  });

  describe('markAsRead', () => {
    it('should call CommandBus.execute with MarkNotificationReadCommand', async () => {
      mockCommandBus.execute.mockResolvedValue(undefined);

      const user = { sub: 1, email: 'admin@test.com', username: 'admin', role: 'Admin' };
      const result = await controller.markAsRead(user, 5);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new MarkNotificationReadCommand(5, 1),
      );
      expect(result).toEqual({ message: 'Notification marked as read' });
    });
  });

  describe('markAllAsRead', () => {
    it('should call CommandBus.execute with MarkAllNotificationsReadCommand', async () => {
      mockCommandBus.execute.mockResolvedValue(undefined);

      const user = { sub: 1, email: 'admin@test.com', username: 'admin', role: 'Admin' };
      const result = await controller.markAllAsRead(user);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new MarkAllNotificationsReadCommand(1),
      );
      expect(result).toEqual({ message: 'All notifications marked as read' });
    });
  });
});
