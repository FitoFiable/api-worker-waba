export type ConversionMethod = 'CLOUDFLARE_WHISPER' | 'NONE';

export interface CloudflareWhisperConfig {
  accountId: string;
  apiToken: string;
  endpoint?: string;
}

export interface AudioToTextOptions {
  method: ConversionMethod;
  cloudflareWhisperConfig?: CloudflareWhisperConfig;
}

export interface WhisperResponse {
  text: string;
  success: boolean;
  result?: {
    text: string;
  };
}
