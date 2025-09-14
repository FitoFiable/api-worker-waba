// Standardized send sticker types for provider-agnostic sending
import { StandardizedSendResponse } from './sendCommon.types.js';

// Standardized input format for sending sticker messages
export type StandardizedSendStickerInput = {
  to: string; // Recipient identifier (e.g., phone number)
  stickerUrl?: string; // URL of the sticker to send
  stickerId?: string; // Media ID of previously uploaded sticker
  replyToMessageId?: string; // Optional message ID to reply to
};

// Re-export common types
export type { StandardizedSendResponse };
