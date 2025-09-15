import { StandardizedSendImageInput, StandardizedSendResponse } from '@/messagingService/standarized/send/sendTypes.js';
import { ProviderConfig, ProviderWabaConfig } from '@/messagingService/index.types.js';
import { validateWabaConfig, validateImageInput } from '../validation.js';

// WABA-specific image message sending
export const sendImageWaba = async (
  input: StandardizedSendImageInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Validate configuration
  const configError = validateWabaConfig(config);
  if (configError) return configError;

  // Validate input
  const inputError = validateImageInput(input.to, input.imageUrl, input.imageId);
  if (inputError) return inputError;

  // Type assertion after validation
  const wabaConfig = config as ProviderWabaConfig;

  try {
    // Prepare WABA API payload
    const payload: any = {
      messaging_product: 'whatsapp',
      to: input.to,
      type: 'image',
      image: {}
    };

    // Set image source (URL or ID)
    if (input.imageUrl) {
      payload.image.link = input.imageUrl;
    } else if (input.imageId) {
      payload.image.id = input.imageId;
    }

    // Add caption if provided
    if (input.caption) {
      payload.image.caption = input.caption;
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
          message: responseData.error?.message || 'Failed to send image',
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
