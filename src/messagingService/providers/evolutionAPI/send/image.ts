import { StandardizedSendImageInput, StandardizedSendResponse } from '@/messagingService/standarized/send/sendImage.types.js';
import { ProviderConfig, ProviderEvolutionAPIConfig } from '@/messagingService/index.types.js';
import { validateEvolutionAPIConfig, validateMediaInput } from '../validation.js';

// Evolution API-specific image message sending
export const sendImageEvolutionAPI = async (
  input: StandardizedSendImageInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Validate configuration
  const configError = validateEvolutionAPIConfig(config);
  if (configError) return configError;

  // Validate input
  const inputError = validateMediaInput(input.to, input.imageUrl, input.imageId);
  if (inputError) return inputError;

  // Type assertion after validation
  const evolutionConfig = config as ProviderEvolutionAPIConfig;

  try {
    // Prepare Evolution API payload
    const payload: any = {
      number: input.to,
      mediatype: 'image',
      mimetype: 'image/jpeg', // Default mimetype, could be enhanced to detect from URL
      media: input.imageUrl || input.imageId,
      delay: 500,
      linkPreview: false,
      mentionsEveryOne: false
    };

    // Add caption if provided
    if (input.caption) {
      payload.caption = input.caption;
    }

    // Add reply context if provided
    if (input.replyToMessageId) {
      payload.quoted = {
        key: {
          id: input.replyToMessageId
        },
        message: {
          conversation: input.caption || 'Image'
        }
      };
    }

    // Send message via Evolution API
    const response = await fetch(`${evolutionConfig.evolutionAPIUrl}/message/sendMedia/${evolutionConfig.evolutionInstanceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionConfig.evolutionAPIKey
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json() as any;

    if (!response.ok) {
      return {
        success: false,
        error: {
          message: responseData.error?.message || 'Failed to send image',
          code: responseData.error?.code || response.status
        }
      };
    }

    return {
      success: true,
      messageId: responseData.key?.id || responseData.data?.key?.id
    };

  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'NETWORK_ERROR'
      }
    };
  }
};
