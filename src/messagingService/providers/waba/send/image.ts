import { StandardizedSendImageInput, StandardizedSendResponse } from '../../../standarized/send/sendImage.types.js';
import { ProviderConfig } from '../../../index.types.js';

// WABA-specific image message sending
export const sendImageWaba = async (
  input: StandardizedSendImageInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Validate required configuration
  if (!config.whatsappToken) {
    return {
      success: false,
      error: {
        message: 'WhatsApp token is required for sending messages',
        code: 'MISSING_TOKEN'
      }
    };
  }

  if (!config.whatsappPhoneNumberId) {
    return {
      success: false,
      error: {
        message: 'WhatsApp phone number ID is required for sending messages',
        code: 'MISSING_PHONE_NUMBER_ID'
      }
    };
  }

  // Validate required input
  if (!input.to || (!input.imageUrl && !input.imageId)) {
    return {
      success: false,
      error: {
        message: 'Recipient and either image URL or image ID are required',
        code: 'INVALID_INPUT'
      }
    };
  }

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
    const response = await fetch(`https://graph.facebook.com/v23.0/${config.whatsappPhoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.whatsappToken}`,
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
