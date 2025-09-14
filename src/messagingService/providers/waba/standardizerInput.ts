import { 
  WhatsAppWebhookPayload, 
  WhatsAppMessage, 
  WhatsAppTextMessage, 
  WhatsAppAudioMessage, 
  WhatsAppImageMessage, 
  WhatsAppInteractiveMessage 
} from './standarizerInput.types.js';

import { imageInputToText } from './receive/image.js';
import { audioInputToText } from './receive/audio.js';

import { StandardizedMessage, ProviderConfig } from '../../index.types.js';

export const standardizeWabaMessage = async (
  message: WhatsAppMessage,
  receiverID: string,
  config?: ProviderConfig
): Promise<StandardizedMessage | null> => {
  
  // Determine message type and content
  let messageType: StandardizedMessage['messageType'];
  let content = '';
  
  switch (message.type) {
    case 'text':
      messageType = 'text';
      content = (message as WhatsAppTextMessage).text.body;
      break;
    
    case 'audio':
      messageType = 'audio';
      content = await audioInputToText(message as WhatsAppAudioMessage, config!);
      break;
    
    case 'image':
      messageType = 'image';
      content = await imageInputToText(message as WhatsAppImageMessage, config!);
      break;

    case 'interactive':
      messageType = 'list_reply';
      const interactiveMessage = message as WhatsAppInteractiveMessage;
      if (interactiveMessage.interactive.type === 'list_reply') {
        content = `${interactiveMessage.interactive.list_reply.title}: ${interactiveMessage.interactive.list_reply.description}`;
      } else {
        content = 'Interactive message';
      }
      break; 
    
    default:
      console.warn(`Unsupported message type: ${(message as any).type}`);
      return null;
  }

  const standardizedMessage: StandardizedMessage = {
    messageId: message.id,
    sender: message.from,
    receiver: receiverID,
    timestamp: message.timestamp,
    messageType,
    content,
    asociatedMessageId: message.context?.id,
  };

  return standardizedMessage;
};

