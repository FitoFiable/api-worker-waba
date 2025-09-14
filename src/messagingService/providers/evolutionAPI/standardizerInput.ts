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

export const standardizeEvolutionAPIMessage = async (
  message: EvolutionAPIMessage,
  senderID: string,
  config: ProviderConfig,
  contextInfo?: any
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
    const audioMessage = message as EvolutionAPIAudioMessage;
    content = await audioInputToText(audioMessage, config);
  }
  // Check for image message
  else if ('imageMessage' in message) {
    messageType = 'image';
    const imageMessage = message as EvolutionAPIImageMessage;
    // Use caption if available, otherwise process image
    if (imageMessage.imageMessage.caption) {
      content = imageMessage.imageMessage.caption;
    } else {
      content = await imageInputToText(imageMessage, config);
    }
  }
  else {
    console.warn(`Unsupported message type. Only text, audio, and image are supported: ${JSON.stringify(message)}`);
    return null;
  }

  // Extract message ID from contextInfo if available, otherwise generate one
  const messageId = contextInfo?.stanzaId || `evolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Extract associated message ID from contextInfo if this is a reply
  const associatedMessageId = contextInfo?.stanzaId || undefined;

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
  audioMessage: EvolutionAPIAudioMessage,
  config: ProviderConfig
): Promise<string> => {
  try {
    // Check if we have audio processing service available
    if (config.cloudflareCredentials) {
      const audioService = new AudioToTextService({
        method: 'CLOUDFLARE_WHISPER',
        cloudflareWhisperConfig: {
          accountId: config.cloudflareCredentials.accountId,
          apiToken: config.cloudflareCredentials.apiToken
        }
      });
      
      // Extract audio URL from the message
      const audioUrl = audioMessage.audioMessage.url;
      if (audioUrl) {
        // In a real implementation, you would process the audio URL here
        // return await audioService.transcribe(audioUrl);
        return 'Audio message (transcription not implemented)';
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
  imageMessage: EvolutionAPIImageMessage,
  config: ProviderConfig
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
      
      // Extract image URL from the message
      const imageUrl = imageMessage.imageMessage.url;
      if (imageUrl) {
        // In a real implementation, you would process the image URL here
        // return await imageService.extractText(imageUrl);
        return 'Image message (OCR not implemented)';
      }
    }
    
    return 'Image message';
  } catch (error) {
    console.error('Error processing image message:', error);
    return 'Image message (processing failed)';
  }
};
