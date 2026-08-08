import { RuleEvaluationService } from './rule-evaluation.service';
import { AlertService } from './alert.service';
import { EmailService } from './email.service';
import { RedisPublisherService } from './redis-publisher.service';
import { AlertRule, ConditionOperator } from './alert-rule.entity';
import { Alert, AlertStatus } from './alert.entity';
import { Repository } from 'typeorm';

describe('RuleEvaluationService', () => {
  let service: RuleEvaluationService;
  let mockRuleRepo: Partial<Repository<AlertRule>>;
  let mockAlertService: Partial<AlertService>;
  let mockEmailService: Partial<EmailService>;
  let mockRedisPublisher: Partial<RedisPublisherService>;

  beforeEach(() => {
    mockRuleRepo = {
      find: jest.fn(),
    } as any;
    mockAlertService = {
      createAlert: jest.fn().mockImplementation((data) => Promise.resolve({
        id: 'alert-123',
        ...data,
      } as Alert)),
    } as any;
    mockEmailService = {
      sendAlertEmail: jest.fn(),
    } as any;
    mockRedisPublisher = {
      publishAlert: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Instantiate service with mocked RedisPublisherService
    service = new RuleEvaluationService(
      mockRuleRepo as Repository<AlertRule>,
      mockAlertService as AlertService,
      mockEmailService as EmailService,
      mockRedisPublisher as any,
    );  });

  it('should create alert, send email and publish to Redis when condition matches', async () => {
    const rule: AlertRule = {
      id: 'rule-1',
      name: 'High Temp',
      condition: { field: 'temperature', operator: ConditionOperator.GT, value: 50 },
      severity: 'high',
      deviceId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    (mockRuleRepo.find as jest.Mock).mockResolvedValue([rule]);

    const payload = { temperature: 60 };
    await service.evaluateTelemetry('device-1', payload);

    expect(mockAlertService.createAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceId: 'device-1',
        ruleId: 'rule-1',
        status: AlertStatus.ACTIVE,
        payload,
      }),
    );
    expect(mockEmailService.sendAlertEmail).toHaveBeenCalled();
    expect(mockRedisPublisher.publishAlert).toHaveBeenCalled();
  });

  it('should not create alert when condition does not match', async () => {
    const rule: AlertRule = {
      id: 'rule-2',
      name: 'Low Temp',
      condition: { field: 'temperature', operator: ConditionOperator.LT, value: 10 },
      severity: 'low',
      deviceId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    (mockRuleRepo.find as jest.Mock).mockResolvedValue([rule]);

    const payload = { temperature: 20 };
    await service.evaluateTelemetry('device-2', payload);

    expect(mockAlertService.createAlert).not.toHaveBeenCalled();
    expect(mockEmailService.sendAlertEmail).not.toHaveBeenCalled();
    expect(mockRedisPublisher.publishAlert).not.toHaveBeenCalled();
  });
});
