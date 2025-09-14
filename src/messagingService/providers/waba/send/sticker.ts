import { StandardizedSendStickerInput, StandardizedSendResponse } from '../../../standarized/send/sendSticker.types.js';
import { ProviderConfig } from '../../../index.types.js';

// WABA-specific sticker message sending
export const sendStickerWaba = async (
  input: StandardizedSendStickerInput,
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
  if (!input.to || (!input.stickerUrl && !input.stickerId)) {
    return {
      success: false,
      error: {
        message: 'Recipient and either sticker URL or sticker ID are required',
        code: 'INVALID_INPUT'
      }
    };
  }

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
