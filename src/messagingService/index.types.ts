// Export all types from the messaging provider module

import { WhatsAppMessage } from "./providers/waba/standarizerInput.types.js";

// Generic error response type
export type GenericErrorResponse = {
    error: {
      message: string;
      type: string;
      code: number;
    };
  };

// Single message input type for individual message processing
export type SingleMessageInput = {
  message: WhatsAppMessage;
  receiverID: string;
};
  
// Union type for all possible messaging provider inputs
export type MessagingProviderInput = 
  | SingleMessageInput
  | GenericErrorResponse;

// General credential configuration types
export interface CloudflareCredentials {
  accountId: string;
  apiToken: string;
}

export interface AWSCredentials {
  accessKey: string;
  secretKey: string;
}

// Provider configuration interface
export interface ProviderWabaConfig {
  cloudflareCredentials?: CloudflareCredentials;
  awsCredentials?: AWSCredentials;
  whatsappToken?: string;
  whatsappPhoneNumberId?: string;
  selectedProvider: "whatsapp";
}

export interface ProviderEvolutionAPIConfig {
  evolutionAPIUrl: string;
  evolutionAPIKey: string;
  evolutionInstanceId: string;
  cloudflareCredentials?: CloudflareCredentials;
  awsCredentials?: AWSCredentials;
  selectedProvider: "evolutionAPI";
}

export type ProviderConfig = ProviderWabaConfig | ProviderEvolutionAPIConfig;

export type { StandardizedMessage } from "./standarized/receive/standarizeMessageReceived.types.js";
