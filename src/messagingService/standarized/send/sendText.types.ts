// Standardized send message types for provider-agnostic sending
import { StandardizedSendResponse } from './sendCommon.types.js';

// Standardized input format for sending text messages
export type StandardizedSendTextInput = {
  to: string; // Recipient identifier (e.g., phone number)
  message: string; // Text content to send
  replyToMessageId?: string; // Optional message ID to reply to
};

// Re-export common types
export type { StandardizedSendResponse };
