import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const encryptedPrefix = 'enc:v1';
const sensitiveKeyPattern = /(token|secret|password|key)$/i;

@Injectable()
export class ChannelCredentialsService {
  encryptCredentials(credentials: Record<string, unknown>) {
    return this.mapCredentials(credentials, (key, value) => {
      if (typeof value !== 'string' || !this.isSensitiveKey(key)) {
        return value;
      }

      return this.encrypt(value);
    });
  }

  decryptCredentials(credentials: Record<string, unknown>) {
    return this.mapCredentials(credentials, (_key, value) => {
      if (typeof value !== 'string' || !value.startsWith(`${encryptedPrefix}:`)) {
        return value;
      }

      return this.decrypt(value);
    });
  }

  maskCredentials(credentials: Record<string, unknown>) {
    return this.mapCredentials(credentials, (key, value) => {
      if (typeof value !== 'string' || !this.isSensitiveKey(key)) {
        return value;
      }

      return '••••••••';
    });
  }

  private mapCredentials(
    credentials: Record<string, unknown>,
    mapper: (key: string, value: unknown) => unknown,
  ) {
    return Object.entries(credentials).reduce<Record<string, unknown>>(
      (mappedCredentials, [key, value]) => {
        mappedCredentials[key] = mapper(key, value);
        return mappedCredentials;
      },
      {},
    );
  }

  private isSensitiveKey(key: string) {
    return sensitiveKeyPattern.test(key);
  }

  private encrypt(value: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return [
      encryptedPrefix,
      iv.toString('base64url'),
      tag.toString('base64url'),
      encrypted.toString('base64url'),
    ].join(':');
  }

  private decrypt(value: string) {
    const [, , ivValue, tagValue, encryptedValue] = value.split(':');

    if (!ivValue || !tagValue || !encryptedValue) {
      return value;
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.key,
      Buffer.from(ivValue, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  private get key() {
    return createHash('sha256')
      .update(process.env.CHANNEL_CREDENTIAL_SECRET ?? 'local-channel-secret')
      .digest();
  }
}
