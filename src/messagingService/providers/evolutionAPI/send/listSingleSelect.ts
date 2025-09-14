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
    // Convert list sections to poll options
    const pollOptions = input.sections.flatMap(section => 
      // section.items.map(item => `${item.title}${item.description ? ` - ${item.description}` : ''}`) # includes descriptions
      section.items.map(item => `${item.title}`)
    );

    // Prepare Evolution API payload for poll (simulating list)
    const payload: any = {
      number: input.to,
      name: `${input.headerText}${input.bodyText ? `\n\n${input.bodyText}` : ''}`,
      selectableCount: 1, // Single select like a list
      values: pollOptions,
      delay: 500,
      linkPreview: false,
      mentionsEveryOne: false
    };

    // Add footer if provided
    if (input.footerText) {
      payload.name += `\n\n${input.footerText}`;
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

    // Send message via Evolution API using poll endpoint
    const response = await fetch(`${evolutionConfig.evolutionAPIUrl}/message/sendPoll/${evolutionConfig.evolutionInstanceId}`, {
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
          message: responseData.error?.message || responseData.message || 'Failed to send poll (simulating list)',
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
