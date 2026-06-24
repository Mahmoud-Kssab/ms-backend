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
    const code = 'code' in error ? error.code : undefined;
    const subcode = 'error_subcode' in error ? error.error_subcode : undefined;
    const detail = [
      typeof code === 'number' ? `code ${code}` : undefined,
      typeof subcode === 'number' ? `subcode ${subcode}` : undefined,
    ]
      .filter(Boolean)
      .join(', ');

    if (typeof message === 'string') {
      return detail ? `${message} (${detail}).` : message;
    }
  }

  return 'Meta validation failed.';
}
