import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGateway } from './notification.gateway';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;

  const mockServer = {
    emit: jest.fn(),
  };

  const mockClient = {
    id: 'socket-id-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationGateway],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);
    // Inject the mock server since @WebSocketServer() is decorator-injected
    gateway.server = mockServer as any;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should log client connection', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      gateway.handleConnection(mockClient as any);

      expect(consoleSpy).toHaveBeenCalledWith('Client connected: socket-id-123');
      consoleSpy.mockRestore();
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      gateway.handleDisconnect(mockClient as any);

      expect(consoleSpy).toHaveBeenCalledWith('Client disconnected: socket-id-123');
      consoleSpy.mockRestore();
    });
  });

  describe('sendNotification', () => {
    it('should emit notification event to all connected clients', () => {
      const payload = { message: 'New notification', type: 'info' };

      gateway.sendNotification('user-1', payload);

      expect(mockServer.emit).toHaveBeenCalledWith('notification', payload);
    });

    it('should broadcast regardless of userId', () => {
      const payload = { message: 'Alert', type: 'warning' };

      gateway.sendNotification('user-99', payload);

      expect(mockServer.emit).toHaveBeenCalledWith('notification', payload);
    });
  });
});
