import { Test, TestingModule } from '@nestjs/testing';
import { AuditInterceptor } from './audit.interceptor';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { of, firstValueFrom } from 'rxjs';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuditInterceptor', () => {
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
        } as any),
        getResponse: () => ({}),
        getNext: () => ({}),
      } as any),
    } as any as ExecutionContext;
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
    // Override the injected repository (since token may differ)
    (interceptor as any).auditRepo = mockRepo;
  });

  it('should log audit entry for POST request and return original result', async () => {
    const ctx = mockContext('POST', '/devices', { id: '123' }, { id: 'user-1' });
    const handler = mockHandler({ success: true });

    const result = await firstValueFrom(interceptor.intercept(ctx, handler));

    expect(result).toEqual({ success: true });
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: '/devices',
        entityId: '123',
        action: 'CREATE',
        performedBy: 'user-1',
        afterJson: { success: true },
      }),
    );
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should skip audit for GET request', async () => {
    const ctx = mockContext('GET', '/devices', {}, {});
    const handler = mockHandler({ data: [] });

    const result = await firstValueFrom(interceptor.intercept(ctx, handler));

    expect(result).toEqual({ data: [] });
    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
