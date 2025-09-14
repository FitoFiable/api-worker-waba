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
    // Format list as a nicely structured text message
    let formattedMessage = `*${input.headerText}*\n\n`;
    
    if (input.bodyText) {
      formattedMessage += `${input.bodyText}\n\n`;
    }

    // Add each section with its items (continuous numbering)
    let globalItemNumber = 1;
    input.sections.forEach((section, sectionIndex) => {
      formattedMessage += `*${section.title}*\n`;
      section.items.forEach((item) => {
        formattedMessage += `${globalItemNumber}. *${item.title}*`;
        if (item.description) {
          formattedMessage += ` - ${item.description}`;
        }
        formattedMessage += `\n`;
        globalItemNumber++;
      });
      if (sectionIndex < input.sections.length - 1) {
        formattedMessage += `\n`;
      }
    });

    // Add footer if provided
    if (input.footerText) {
      formattedMessage += `\n\n${input.footerText}`;
    }

    // Prepare Evolution API payload for text message
    const payload: any = {
      number: input.to,
      text: formattedMessage,
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
          conversation: input.bodyText
        }
      };
    }

    // Send message via Evolution API using text endpoint
    const response = await fetch(`${evolutionConfig.evolutionAPIUrl}/message/sendText/${evolutionConfig.evolutionInstanceId}`, {
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
          message: responseData.error?.message || responseData.message || 'Failed to send formatted list message',
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
