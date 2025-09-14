// Standardized send list single select types for provider-agnostic sending
import { StandardizedSendResponse } from './sendCommon.types.js';

// List item structure
export type StandardizedListItem = {
  id: string; // Unique identifier for the list item
  title: string; // Display title for the list item
  description?: string; // Optional description for the list item
};

// List section structure
export type StandardizedListSection = {
  title: string; // Section title
  items: StandardizedListItem[]; // Items in this section
};

// Standardized input format for sending list single select messages
export type StandardizedSendListSingleSelectInput = {
  to: string; // Recipient identifier (e.g., phone number)
  headerText: string; // Header text for the list
  bodyText: string; // Body text for the list
  footerText?: string; // Optional footer text
  buttonText: string; // Text for the list button
  sections: StandardizedListSection[]; // List sections with items
  replyToMessageId?: string; // Optional message ID to reply to
};

// Re-export common types
export type { StandardizedSendResponse };
