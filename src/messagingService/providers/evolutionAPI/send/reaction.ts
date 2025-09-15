import { StandardizedSendReactionInput, StandardizedSendResponse } from '@/messagingService/standarized/send/sendTypes.js';
import { ProviderConfig, ProviderEvolutionAPIConfig } from '@/messagingService/index.types.js';
import { validateEvolutionAPIConfig, validateReactionInput } from '../validation.js';

// Evolution API-specific reaction message sending
export const sendReactionEvolutionAPI = async (
  input: StandardizedSendReactionInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Validate configuration
  const configError = validateEvolutionAPIConfig(config);
  if (configError) return configError;

  // Validate input
  const inputError = validateReactionInput(input.to, input.emoji, input.messageId);
  if (inputError) return inputError;

  // Type assertion after validation
  const evolutionConfig = config as ProviderEvolutionAPIConfig;

  try {
    // Prepare Evolution API payload
    const payload: any = {
      key: {
        remoteJid: `${input.to}@s.whatsapp.net`,
        fromMe: true,
        id: input.messageId
      },
      reaction: input.emoji
    };
    
    // Debug logging
    console.log('Evolution API Reaction Payload:', JSON.stringify(payload, null, 2));

    // Send message via Evolution API
    const response = await fetch(`${evolutionConfig.evolutionAPIUrl}/message/sendReaction/${evolutionConfig.evolutionInstanceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionConfig.evolutionAPIKey
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json() as any;
    
    // Debug logging
    console.log('Evolution API Reaction Response:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      return {
        success: false,
        error: {
          message: responseData.error?.message || responseData.message || 'Failed to send reaction',
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
