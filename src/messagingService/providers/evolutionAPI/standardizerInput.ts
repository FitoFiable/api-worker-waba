import { 
  EvolutionAPIMessage, 
  EvolutionAPITextMessage, 
 
} from './standarizerInput.types.js';

import { ImageToTextService } from '@/messagingService/services/image_to_text/index.js';
import { AudioToTextService } from '@/messagingService/services/audio_to_text/index.js';

import { StandardizedMessage, ProviderConfig } from '@/messagingService/index.types.js';
import { isEvolutionAPIConfig } from './validation.js';
import { getBase64 } from './getBase64.js';

// External function to upload media files to R2 bucket
const uploadMediaFile = async (
  config: ProviderConfig,
  base64: string,
  filename: string,
  contentType: string
): Promise<string | null> => {
  if (config.selectedProvider !== 'evolutionAPI' || !config.uploadFileEndpoint) {
    return null;
  }

  try {
    const uploadResponse = await fetch(`${config.uploadFileEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64,
        filename,
        contentType
      })
    });

    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json() as { url: string };
      console.log('Media file uploaded successfully:', uploadData.url);
      return uploadData.url;
    } else {
      console.error('Failed to upload media file:', await uploadResponse.text());
      return null;
    }
  } catch (uploadError) {
    console.error('Error uploading media file:', uploadError);
    return null;
  }
};

/**
 * Standardizes Evolution API messages into a common format
 * 
 * Features:
 * - Handles text, audio, and image messages
 * - Automatically uploads media files to R2 bucket if uploadFileEndpoint is configured
 * - Processes audio with Cloudflare Whisper (if configured)
 * - Processes images with AWS Textract (if configured)
 * - Returns standardized message with associatedMediaUrl for uploaded files
 */
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
  let associatedMediaUrl: string | undefined = undefined;
  
  // Check for text message
  if ('conversation' in message) {
    messageType = 'text';
    content = (message as EvolutionAPITextMessage).conversation;
  }
  // Check for audio message
  else if ('audioMessage' in message) {
    messageType = 'audio';
    const base64Data = await getBase64(config, fullMessageData.key.id);
    
    // Upload file to R2 bucket if upload endpoint is configured
    if (config.selectedProvider === 'evolutionAPI' && config.uploadFileEndpoint) {
      const filename = base64Data.fileName || `audio_${fullMessageData.key.id}.${base64Data.mimetype.split('/')[1]}`;
      const uploadResult = await uploadMediaFile(config, base64Data.base64, filename, base64Data.mimetype);
      associatedMediaUrl = uploadResult || undefined;
    }
    
    content = await audioInputToText(config, base64Data);
  }
  // Check for image message
  else if ('imageMessage' in message) {
    messageType = 'image';
    const base64Data = await getBase64(config, fullMessageData.key.id);
    
    // Upload file to R2 bucket if upload endpoint is configured
    if (config.selectedProvider === 'evolutionAPI' && config.uploadFileEndpoint) {
      const filename = base64Data.fileName || `image_${fullMessageData.key.id}.${base64Data.mimetype.split('/')[1]}`;
      const uploadResult = await uploadMediaFile(config, base64Data.base64, filename, base64Data.mimetype);
      associatedMediaUrl = uploadResult || undefined;
    }
    
    content = await imageInputToText(config, base64Data);
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
    associatedMediaUrl,
  };

  return standardizedMessage;
};

// Helper function to process audio messages
// Now receives base64 data directly (upload is handled separately)
const audioInputToText = async (
  config: ProviderConfig,
  base64Data: { base64: string; mimetype: string; fileName: string }
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
      const binary = Uint8Array.from(atob(base64Data.base64), c => c.charCodeAt(0));
      
      if (true) {
        // In a real implementation, you would process the audio URL here
        const transcribedText = await audioService.convertAudioToText(binary, "CLOUDFLARE_WHISPER");
        return transcribedText;
      }
    }
    
    return 'Audio message';
  } catch (error) {
    console.error('Error processing audio message:', error);
    return 'Audio message (processing failed)';
  }
};

// Helper function to process image messages
// Now receives base64 data directly (upload is handled separately)
const imageInputToText = async (
  config: ProviderConfig,
  base64Data: { base64: string; mimetype: string; fileName: string }
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

      const text = await imageService.convertImageToText(undefined, base64Data.base64,'AWS_TEXTRACT');
      return text;
    }
    
    return 'Image message';
  } catch (error) {
    console.error('Error processing image message:', error);
    return 'Image message (processing failed)';
  }
};
