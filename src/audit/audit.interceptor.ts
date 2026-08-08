import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

/**
 * Interceptor that creates an audit log entry for write operations.
 * It records the entity type (derived from the request path), the action
 * (CREATE, UPDATE, DELETE), the user performing the action (if available),
 * and the before/after JSON payloads where applicable.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.route?.path || request.url;

    // Only audit write operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const performedBy = request.user?.id || null;
    const entityId = request.params?.id || null;
    // Normalize entity type to a static resource name (e.g., 'devices')
    const rawEntity = path;
    const entitySegments = rawEntity.split('/').filter(Boolean);
    const entityType = rawEntity;
    const actionMap: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    const action = actionMap[method] || method;

    // Capture the response to log after the handler completes
    return next.handle().pipe(
      mergeMap(async (result) => {
        // result may be a Promise if handler returns one; ensure resolved value
        const after = await Promise.resolve(result);
        const auditData: Partial<AuditLog> = {
          entityType,
          entityId,
          action,
          performedBy,
          beforeJson: undefined,
          afterJson: typeof after === 'object' && after !== null ? (after as Record<string, any>) : undefined,
        };
        let savedAudit: AuditLog | null = null;
        try {
          // Directly save the audit data without creating an entity array
          savedAudit = await this.auditRepo.save(auditData as any);
        } catch (err) {
          this.logger.error('Failed to save audit log', err);
          // Propagate error to be handled by outer catchError
          throw err;
        }
        return after;
      }),
      catchError((err) => {
        // Log and rethrow to avoid swallowing errors
        this.logger.error('Audit interceptor processing error', err);
        throw err;
      })
    );
  }
}
