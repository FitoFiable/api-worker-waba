// Standardized send reaction types for provider-agnostic sending
import { StandardizedSendResponse } from './sendCommon.types.js';

// Standardized input format for sending reaction messages
export type StandardizedSendReactionInput = {
  to: string; // Recipient identifier (e.g., phone number)
  emoji: string; // Emoji to send as reaction (e.g., "👍", "❤️", "😂")
  messageId: string; // ID of the message to react to
};

// Re-export common types
export type { StandardizedSendResponse };
