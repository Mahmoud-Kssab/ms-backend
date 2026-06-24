import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

import { TokenPayload } from '../interfaces/token-payload.interface';

interface SignTokenOptions {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class TokenService {
  constructor(private readonly configService: ConfigService) {}

  signToken({ userId, email, type }: SignTokenOptions) {
    const now = Math.floor(Date.now() / 1000);
    const ttlSeconds = type === 'access' ? 15 * 60 : 7 * 24 * 60 * 60;
    const payload: TokenPayload = {
      sub: userId,
      email,
      type,
      iat: now,
      exp: now + ttlSeconds,
    };
    const encodedHeader = this.encode({ alg: 'HS256', typ: 'JWT' });
    const encodedPayload = this.encode(payload);
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`, type);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verifyToken(token: string, type: 'access' | 'refresh'): TokenPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Invalid authentication token.');
    }

    const expectedSignature = this.sign(`${encodedHeader}.${encodedPayload}`, type);
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedSignatureBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
      throw new UnauthorizedException('Invalid authentication token.');
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as TokenPayload;

    if (payload.type !== type || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Expired authentication token.');
    }

    return payload;
  }

  private encode(value: unknown) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private sign(value: string, type: 'access' | 'refresh') {
    const secret =
      type === 'access'
        ? this.configService.get<string>('JWT_ACCESS_SECRET') ?? 'local-access-secret'
        : this.configService.get<string>('JWT_REFRESH_SECRET') ??
          'local-refresh-secret';

    return createHmac('sha256', secret).update(value).digest('base64url');
  }
}
