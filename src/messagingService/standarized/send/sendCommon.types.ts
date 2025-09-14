// Common types shared across all send message types

// Standardized response format for sent messages
export type StandardizedSendResponse = {
  success: boolean;
  messageId?: string; // Provider-specific message ID if successful
  error?: {
    message: string;
    code?: string | number;
  };
};
