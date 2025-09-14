import { 
  EvolutionAPIWebhookPayload, 
  EvolutionAPIMessage, 
  EvolutionAPITextMessage, 
  EvolutionAPIAudioMessage, 
  EvolutionAPIImageMessage, 
  EvolutionAPIVideoMessage,
  EvolutionAPIDocumentMessage,
  EvolutionAPIStickerMessage,
  EvolutionAPIInteractiveMessage 
} from './standarizerInput.types.js';

import { imageInputToText } from './receive/image.js';
import { audioInputToText } from './receive/audio.js';

import { StandardizedMessage, ProviderConfig } from '@/messagingService/index.types.js';
import { isEvolutionAPIConfig } from './validation.js';

export const standardizeEvolutionAPIMessage = async (
  message: EvolutionAPIMessage,
  receiverID: string,
  config: ProviderConfig
): Promise<StandardizedMessage | null> => {
  // Validate that config is for Evolution API
  if (!isEvolutionAPIConfig(config)) {
    console.warn('Invalid configuration: expected Evolution API provider');
    return null;
  }
  
  // Determine message type and content
  let messageType: StandardizedMessage['messageType'];
  let content = '';
  
  // Check for text message
  if ('conversation' in message) {
    messageType = 'text';
    content = (message as EvolutionAPITextMessage).conversation;
  }
  // Check for audio message
  else if ('audioMessage' in message) {
    messageType = 'audio';
    content = await audioInputToText(message as EvolutionAPIAudioMessage, config);
  }
  // Check for image message
  else if ('imageMessage' in message) {
    messageType = 'image';
    const imageMessage = message as EvolutionAPIImageMessage;
    content = await imageInputToText(imageMessage, config);
    // Use caption if available
    if (imageMessage.imageMessage.caption) {
      content = imageMessage.imageMessage.caption;
    }
  }
  // Check for video message
  else if ('videoMessage' in message) {
    messageType = 'video';
    const videoMessage = message as EvolutionAPIVideoMessage;
    content = videoMessage.videoMessage.caption || 'Video message';
  }
  // Check for document message
  else if ('documentMessage' in message) {
    messageType = 'document';
    const docMessage = message as EvolutionAPIDocumentMessage;
    content = docMessage.documentMessage.fileName || 'Document';
  }
  // Check for sticker message
  else if ('stickerMessage' in message) {
    messageType = 'sticker';
    content = 'Sticker';
  }
  // Check for interactive message (list reply)
  else if ('interactiveMessage' in message) {
    messageType = 'list_reply';
    const interactiveMessage = message as EvolutionAPIInteractiveMessage;
    if (interactiveMessage.interactiveMessage.type === 'listResponseMessage') {
      const listReply = interactiveMessage.interactiveMessage.listResponseMessage;
      content = `${listReply.title}: ${listReply.description || ''}`;
    } else {
      content = 'Interactive message';
    }
  }
  else {
    console.warn(`Unsupported message type: ${JSON.stringify(message)}`);
    return null;
  }

  // Generate a message ID (Evolution API doesn't provide one in the same format)
  const messageId = `evolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const standardizedMessage: StandardizedMessage = {
    messageId,
    sender: receiverID, // This would need to be extracted from the webhook payload
    receiver: receiverID,
    timestamp: Date.now().toString(),
    messageType,
    content,
    asociatedMessageId: undefined, // This would need to be extracted from contextInfo if available
  };

  return standardizedMessage;
};
