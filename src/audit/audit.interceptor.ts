import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
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
    const entityType = path;
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
        const audit = this.auditRepo.create({
          entityType,
          entityId,
          action,
          performedBy,
          // beforeJson omitted to avoid null assignment
          afterJson: after,
        });
        // Fire and forget – we don't block the main flow
        this.auditRepo.save(audit).catch((err) => {
          this.logger.error('Failed to save audit log', err);
        });
        return after;
      }),
    );
  }
}
