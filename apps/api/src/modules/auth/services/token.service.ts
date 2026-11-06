import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  /**
   * Generates a cryptographically secure random token (64 hex characters).
   */
  generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hashes a raw token with SHA-256 for secure database storage.
   * Storing hashes rather than raw tokens protects users if the database is read.
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
