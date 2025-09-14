export type ConversionMethod = 'AWS_TEXTRACT' | 'NONE';

export interface AWSTextractConfig {
  accessKey: string;
  secretKey: string;
  region?: string;
  endpoint?: string;
}

export interface ImageToTextOptions {
  method: ConversionMethod;
  awsTextractConfig?: AWSTextractConfig;
}

export interface TextractResponse {
  text: string;
  confidence?: number;
  blocks?: Array<{
    text: string;
    confidence: number;
    type: string;
  }>;
}
