import { StandardizedSendStickerInput, StandardizedSendResponse } from '@/messagingService/standarized/send/sendTypes.js';
import { ProviderConfig, ProviderEvolutionAPIConfig } from '@/messagingService/index.types.js';
import { validateEvolutionAPIConfig, validateStickerInput } from '../validation.js';

// Evolution API-specific sticker message sending
export const sendStickerEvolutionAPI = async (
  input: StandardizedSendStickerInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Validate configuration
  const configError = validateEvolutionAPIConfig(config);
  if (configError) return configError;

  // Validate input
  const inputError = validateStickerInput(input.to, input.stickerUrl, input.stickerId);
  if (inputError) return inputError;

  // Type assertion after validation
  const evolutionConfig = config as ProviderEvolutionAPIConfig;

  try {
    // Prepare Evolution API payload
    const payload: any = {
      number: input.to,
      sticker: input.stickerUrl || input.stickerId,
      delay: 500,
      linkPreview: false,
      mentionsEveryOne: false
    };

    // Add reply context if provided
    if (input.replyToMessageId) {
      payload.quoted = {
        key: {
          id: input.replyToMessageId
        },
        message: {
          conversation: 'Sticker'
        }
      };
    }

    // Send message via Evolution API
    const response = await fetch(`${evolutionConfig.evolutionAPIUrl}/message/sendSticker/${evolutionConfig.evolutionInstanceId}`, {
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
          message: responseData.error?.message || 'Failed to send sticker',
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
