import { StandardizedSendListSingleSelectInput, StandardizedSendResponse } from '../../../standarized/send/sendListSingleSelect.types.js';
import { ProviderConfig } from '../../../index.types.js';

// WABA-specific list single select message sending
export const sendListSingleSelectWaba = async (
  input: StandardizedSendListSingleSelectInput,
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
  if (!input.to || !input.headerText || !input.bodyText || !input.buttonText || !input.sections || input.sections.length === 0) {
    return {
      success: false,
      error: {
        message: 'Recipient, header text, body text, button text, and at least one section are required',
        code: 'INVALID_INPUT'
      }
    };
  }

  // Validate sections and items
  for (const section of input.sections) {
    if (!section.title || !section.items || section.items.length === 0) {
      return {
        success: false,
        error: {
          message: 'Each section must have a title and at least one item',
          code: 'INVALID_SECTION'
        }
      };
    }

    for (const item of section.items) {
      if (!item.id || !item.title) {
        return {
          success: false,
          error: {
            message: 'Each list item must have an id and title',
            code: 'INVALID_ITEM'
          }
        };
      }
    }
  }

  try {
    // Prepare WABA API payload
    const payload: any = {
      messaging_product: 'whatsapp',
      to: input.to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: input.headerText
        },
        body: {
          text: input.bodyText
        },
        action: {
          button: input.buttonText,
          sections: input.sections.map(section => ({
            title: section.title,
            rows: section.items.map(item => ({
              id: item.id,
              title: item.title,
              description: item.description || ''
            }))
          }))
        }
      }
    };

    // Add footer if provided
    if (input.footerText) {
      payload.interactive.footer = {
        text: input.footerText
      };
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
          message: responseData.error?.message || 'Failed to send list',
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
