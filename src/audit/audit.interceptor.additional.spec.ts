import { Test, TestingModule } from '@nestjs/testing';
import { AuditInterceptor } from './audit.interceptor';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { of, firstValueFrom } from 'rxjs';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuditInterceptor - additional methods', () => {
  let interceptor: AuditInterceptor;
  let mockRepo: Partial<Repository<AuditLog>>;

  const mockContext = (method: string, path: string, params = {}, user = {}): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          route: { path },
          url: path,
          params,
          user,
        }),
      })),
    } as unknown as ExecutionContext;
  };

  const mockHandler = (result: any): CallHandler => {
    return {
      handle: () => of(result),
    } as CallHandler;
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockImplementation((dto) => dto as AuditLog),
      save: jest.fn().mockResolvedValue(undefined),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepo,
        },
      ],
    }).compile();
    interceptor = module.get<AuditInterceptor>(AuditInterceptor);
    (interceptor as any).auditRepo = mockRepo;
  });

  const methods = [
    { method: 'PUT', action: 'UPDATE' },
    { method: 'PATCH', action: 'UPDATE' },
    { method: 'DELETE', action: 'DELETE' },
  ];

  methods.forEach(({ method, action }) => {
    it(`should log audit entry for ${method} request`, async () => {
      const ctx = mockContext(method, '/devices', { id: 'abc' }, { id: 'user-2' });
      const handlerResult = method === 'DELETE' ? { deleted: true } : { success: true };
      const handler = mockHandler(handlerResult);

      const result = await firstValueFrom(interceptor.intercept(ctx, handler));

      expect(result).toEqual(handlerResult);
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: '/devices',
          entityId: 'abc',
          action,
          performedBy: 'user-2',
          afterJson: handlerResult,
        }),
      );
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });
});
