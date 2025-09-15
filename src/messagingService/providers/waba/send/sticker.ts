import { StandardizedSendStickerInput, StandardizedSendResponse } from '@/messagingService/standarized/send/sendTypes.js';
import { ProviderConfig, ProviderWabaConfig } from '@/messagingService/index.types.js';
import { validateWabaConfig, validateStickerInput } from '../validation.js';

// WABA-specific sticker message sending
export const sendStickerWaba = async (
  input: StandardizedSendStickerInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Validate configuration
  const configError = validateWabaConfig(config);
  if (configError) return configError;

  // Validate input
  const inputError = validateStickerInput(input.to, input.stickerUrl, input.stickerId);
  if (inputError) return inputError;

  // Type assertion after validation
  const wabaConfig = config as ProviderWabaConfig;

  try {
    // Prepare WABA API payload
    const payload: any = {
      messaging_product: 'whatsapp',
      to: input.to,
      type: 'sticker',
      sticker: {}
    };

    // Set sticker source (URL or ID)
    if (input.stickerUrl) {
      payload.sticker.link = input.stickerUrl;
    } else if (input.stickerId) {
      payload.sticker.id = input.stickerId;
    }

    // Add reply context if provided
    if (input.replyToMessageId) {
      payload.context = {
        message_id: input.replyToMessageId
      };
    }

    // Send message via WABA API
    const response = await fetch(`https://graph.facebook.com/v23.0/${wabaConfig.whatsappPhoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${wabaConfig.whatsappToken}`,
        'Content-Type': 'application/json'
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
      messageId: responseData.messages?.[0]?.id
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
