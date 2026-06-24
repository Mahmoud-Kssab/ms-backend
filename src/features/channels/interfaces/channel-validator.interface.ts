import { ChannelProvider } from '../enums/channel-provider.enum';

export interface ValidatedChannelProfile {
  externalId: string;
  name: string;
  profile: Record<string, unknown>;
}

export interface BaseChannelValidator {
  readonly provider: ChannelProvider;
  validate(credentials: Record<string, unknown>): Promise<ValidatedChannelProfile>;
}
