// Main messaging provider send reaction standardization switch
import { sendReactionWaba } from '../../providers/waba/send/reaction.js';
import { StandardizedSendReactionInput, StandardizedSendResponse } from './sendReaction.types.js';
import { ProviderConfig, providers } from '../../index.types.js';

// Main standardization function that detects provider and routes accordingly
export const standardizeSendReaction = async (
  input: StandardizedSendReactionInput,
  config?: ProviderConfig,
  provider?: providers
): Promise<StandardizedSendResponse> => {
  // Route to appropriate provider based on provider type
  switch (provider) {
    case 'whatsapp':
      return await sendReactionWaba(input, config || {});
    
    // Future providers can be added here
    // case 'telegram':
    //   return sendReactionTelegram(input, config);
    // case 'discord':
    //   return sendReactionDiscord(input, config);
    
    default:
      return {
        success: false,
        error: {
          message: `Unsupported messaging provider: ${provider}`,
          code: 'UNSUPPORTED_PROVIDER'
        }
      };
  }
};
