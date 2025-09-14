import { StandardizedSendListSingleSelectInput, StandardizedSendResponse } from '@/messagingService/standarized/send/sendListSingleSelect.types.js';
import { ProviderConfig, ProviderWabaConfig } from '@/messagingService/index.types.js';
import { validateWabaConfig, validateListInput } from '../validation.js';

// WABA-specific list single select message sending
export const sendListSingleSelectWaba = async (
  input: StandardizedSendListSingleSelectInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Validate configuration
  const configError = validateWabaConfig(config);
  if (configError) return configError;

  // Validate input
  const inputError = validateListInput(input.to, input.headerText, input.bodyText, input.buttonText, input.sections);
  if (inputError) return inputError;

  // Type assertion after validation
  const wabaConfig = config as ProviderWabaConfig;

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
