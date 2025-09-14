import { StandardizedSendTextInput, StandardizedSendResponse } from '@/messagingService/standarized/send/sendText.types.js';
import { ProviderConfig, ProviderEvolutionAPIConfig } from '@/messagingService/index.types.js';
import { validateEvolutionAPIConfig, validateBasicInput } from '../validation.js';

// Evolution API-specific text message sending
export const sendTextEvolutionAPI = async (
  input: StandardizedSendTextInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Validate configuration
  const configError = validateEvolutionAPIConfig(config);
  if (configError) return configError;

  // Validate input
  const inputError = validateBasicInput(input.to, input.message);
  if (inputError) return inputError;

  // Type assertion after validation
  const evolutionConfig = config as ProviderEvolutionAPIConfig;

  try {
    // Prepare Evolution API payload
    const payload: any = {
      number: input.to,
      text: input.message,
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
          conversation: input.message
        }
      };
    }

    // Send message via Evolution API
    const response = await fetch(`${evolutionConfig.evolutionAPIUrl}/message/sendText/${evolutionConfig.evolutionInstanceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionConfig.evolutionAPIKey
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json() as any;
    
    // Debug logging
    console.log('Evolution API Response:', JSON.stringify(responseData, null, 2));

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
