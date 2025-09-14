import { StandardizedSendListSingleSelectInput, StandardizedSendResponse } from '@/messagingService/standarized/send/sendListSingleSelect.types.js';
import { ProviderConfig, ProviderEvolutionAPIConfig } from '@/messagingService/index.types.js';
import { validateEvolutionAPIConfig, validateListInput } from '../validation.js';

// Evolution API-specific list single select message sending
export const sendListSingleSelectEvolutionAPI = async (
  input: StandardizedSendListSingleSelectInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Validate configuration
  const configError = validateEvolutionAPIConfig(config);
  if (configError) return configError;

  // Validate input
  const inputError = validateListInput(input.to, input.headerText, input.bodyText, input.buttonText, input.sections);
  if (inputError) return inputError;

  // Type assertion after validation
  const evolutionConfig = config as ProviderEvolutionAPIConfig;

  try {
    // Prepare Evolution API payload
    const payload: any = {
      number: input.to,
      title: input.headerText,
      description: input.bodyText,
      buttonText: input.buttonText,
      values: input.sections.map(section => ({
        title: section.title,
        rows: section.items.map(item => ({
          title: item.title,
          description: item.description || '',
          rowId: item.id
        }))
      })),
      delay: 500,
      linkPreview: false,
      mentionsEveryOne: false
    };

    // Add footer if provided
    if (input.footerText) {
      payload.footerText = input.footerText;
    }

    // Add reply context if provided
    if (input.replyToMessageId) {
      payload.quoted = {
        key: {
          id: input.replyToMessageId
        },
        message: {
          conversation: input.bodyText
        }
      };
    }

    // Send message via Evolution API
    const response = await fetch(`${evolutionConfig.evolutionAPIUrl}/message/sendList/${evolutionConfig.evolutionInstanceId}`, {
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
          message: responseData.error?.message || 'Failed to send list',
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
