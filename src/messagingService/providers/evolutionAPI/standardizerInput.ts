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

import { ImageToTextService } from '@/messagingService/services/image_to_text/index.js';
import { AudioToTextService } from '@/messagingService/services/audio_to_text/index.js';

import { StandardizedMessage, ProviderConfig } from '@/messagingService/index.types.js';
import { isEvolutionAPIConfig } from './validation.js';
import { getBase64 } from './getBase64.js';

export const standardizeEvolutionAPIMessage = async (
  message: EvolutionAPIMessage,
  senderID: string,
  config: ProviderConfig,
  fullMessageData?: any
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
    content = await audioInputToText(config, fullMessageData);
  }
  // Check for image message
  else if ('imageMessage' in message) {
    messageType = 'image';
    content = await imageInputToText(config, fullMessageData);
    
  }
  else {
    console.warn(`Unsupported message type. Only text, audio, and image are supported: ${JSON.stringify(message)}`);
    return null;
  }

  // Extract message ID from fullMessageData if available, otherwise generate one
  const messageId = fullMessageData?.key?.id || `evolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Extract associated message ID from contextInfo if this is a reply
  const associatedMessageId = fullMessageData?.contextInfo?.stanzaId || undefined;

  const standardizedMessage: StandardizedMessage = {
    messageId,
    sender: senderID,
    receiver: config.evolutionInstanceId || 'unknown', // Use instance ID as receiver
    timestamp: Date.now().toString(),
    messageType,
    content,
    asociatedMessageId: associatedMessageId,
  };

  return standardizedMessage;
};

// Helper function to process audio messages
const audioInputToText = async (
  config: ProviderConfig,
  fullMessageData: any
): Promise<string> => {
  try {
    if (config.cloudflareCredentials) {
      const audioService = new AudioToTextService({
        method: 'CLOUDFLARE_WHISPER',
        cloudflareWhisperConfig: {
          accountId: config.cloudflareCredentials.accountId,
          apiToken: config.cloudflareCredentials.apiToken
        }
      });
      const base64 = await getBase64(config, fullMessageData.key.id);
      const binary = Uint8Array.from(atob(base64.base64), c => c.charCodeAt(0));
      
      if (true) {
        // In a real implementation, you would process the audio URL here
        return await audioService.convertAudioToText(binary, "CLOUDFLARE_WHISPER");
      }
    }
    
    return 'Audio message';
  } catch (error) {
    console.error('Error processing audio message:', error);
    return 'Audio message (processing failed)';
  }
};

// Helper function to process image messages
const imageInputToText = async (
  config: ProviderConfig,
  fullMessageData: any
): Promise<string> => {
  try {
    // Check if we have image processing service available
    if (config.awsCredentials) {
      const imageService = new ImageToTextService({
        method: 'AWS_TEXTRACT',
        awsTextractConfig: {
          accessKey: config.awsCredentials.accessKey,
          secretKey: config.awsCredentials.secretKey
        }
      });

      const base64 = await getBase64(config, fullMessageData.key.id);
      const text = await imageService.convertImageToText(undefined, base64.base64,'AWS_TEXTRACT');
      return text;
  
    }
    
    return 'Image message';
  } catch (error) {
    console.error('Error processing image message:', error);
    return 'Image message (processing failed)';
  }
};
