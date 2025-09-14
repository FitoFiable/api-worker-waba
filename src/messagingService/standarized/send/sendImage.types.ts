// Standardized send image types for provider-agnostic sending
import { StandardizedSendResponse } from './sendCommon.types.js';

// Standardized input format for sending image messages
export type StandardizedSendImageInput = {
  to: string; // Recipient identifier (e.g., phone number)
  imageUrl?: string; // URL of the image to send
  imageId?: string; // Media ID of previously uploaded image
  caption?: string; // Optional caption for the image
  replyToMessageId?: string; // Optional message ID to reply to
};

// Re-export common types
export type { StandardizedSendResponse };
