// Shared types for messaging provider standardization

// Standardized Output Format - Provider agnostic
export type StandardizedMessage = {
  messageId?: string; // Unique identifier for the message if available
  sender: string; // Sender of the message ejm. phone number
  receiver: string; // Receiver of the message ejm. phone number
  timestamp: string; // Timestamp of the message
  messageType: "text" | "audio" | "image" | "list_reply"; // Type of the message
  asociatedMessageId?: string; // MessageId of the message that this message is associated with (e.g. a reply to a message)
  associatedMediaUrl?: string; // URL of the media that this message is associated with (e.g. a reply to a message)
  content: string; // Content of the message - always a string for simplicity (audio and images are converted to a string)
};

