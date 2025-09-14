import { StandardizedSendTextInput, StandardizedSendResponse } from '../../../standarized/send/sendText.types.js';
import { ProviderConfig } from '../../../index.types.js';

// WABA-specific text message sending
export const sendTextWaba = async (
  input: StandardizedSendTextInput,
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
  if (!input.to || !input.message) {
    return {
      success: false,
      error: {
        message: 'Recipient and message content are required',
        code: 'INVALID_INPUT'
      }
    };
  }

  try {
    // Prepare WABA API payload
    const payload: any = {
      messaging_product: 'whatsapp',
      to: input.to,
      type: 'text',
      text: {
        body: input.message
      }
    };

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
          message: responseData.error?.message || 'Failed to send message',
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
