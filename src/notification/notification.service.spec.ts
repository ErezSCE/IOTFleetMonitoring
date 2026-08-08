import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';

// Mock ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      subscribe: jest.fn((channel: string, cb: (err: any, count: number) => void) => {
        // Simulate successful subscription
        cb(null, 1);
      }),
      on: jest.fn(),
      disconnect: jest.fn(),
    };
  });
});

describe('NotificationService', () => {
  let mockGateway: Partial<NotificationGateway>;
  let service: NotificationService;
  let redisInstance: any;

  beforeEach(() => {
    mockGateway = {
      broadcastDeviceUpdate: jest.fn(),
    };
    // Clear previous mock calls
    const ioredis = require('ioredis');
    ioredis.mockClear();
    service = new NotificationService(mockGateway as NotificationGateway);
    // Capture the Redis instance created inside the service
    redisInstance = (service as any).redisSubscriber;
  });

  it('should subscribe to Redis channel on init', () => {
    const ioredis = require('ioredis');
    service.onModuleInit();
    expect(ioredis).toHaveBeenCalledWith({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    });
    expect(redisInstance.subscribe).toHaveBeenCalledWith('device-updates', expect.any(Function));
  });

  it('should forward valid JSON messages to gateway', () => {
    service.onModuleInit();
    // Retrieve the message handler registered on the mock Redis instance
    const messageHandler = redisInstance.on.mock.calls.find((c: any) => c[0] === 'message')[1];
    const payload = { deviceId: 1, location: { lat: 10, lng: 20 } };
    messageHandler('device-updates', JSON.stringify(payload));
    expect(mockGateway.broadcastDeviceUpdate).toHaveBeenCalledWith(payload);
  });

  it('should ignore messages from other channels', () => {
    service.onModuleInit();
    const messageHandler = redisInstance.on.mock.calls.find((c: any) => c[0] === 'message')[1];
    const payload = { foo: 'bar' };
    messageHandler('other-channel', JSON.stringify(payload));
    expect(mockGateway.broadcastDeviceUpdate).not.toHaveBeenCalled();
  });

  it('should handle invalid JSON without crashing', () => {
    service.onModuleInit();
    const messageHandler = redisInstance.on.mock.calls.find((c: any) => c[0] === 'message')[1];
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    messageHandler('device-updates', 'invalid-json');
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(mockGateway.broadcastDeviceUpdate).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
