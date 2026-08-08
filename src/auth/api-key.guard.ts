import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Simple API‑key guard for demonstration purposes.
 * Checks the `x-api-key` header against a predefined key.
 * In a real system this would verify against a DB or config service.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  // Hard‑coded valid API key – replace with env/config as needed.
  private readonly validApiKey = process.env.API_KEY || 'test-key';

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    if (!apiKey || apiKey !== this.validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }
    return true;
  }
}
