import { BadRequestException } from '@nestjs/common';

export function getRequiredString(
  credentials: Record<string, unknown>,
  key: string,
  providerLabel: string,
) {
  const value = credentials[key];

  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${providerLabel} requires ${key}.`);
  }

  return value.trim();
}

export async function readJsonResponse(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function graphErrorMessage(payload: Record<string, unknown>) {
  const error = payload.error;

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = error.message;
    return typeof message === 'string' ? message : 'Meta validation failed.';
  }

  return 'Meta validation failed.';
}
