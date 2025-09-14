// Main messaging provider send reaction standardization switch
import { sendReactionWaba } from '../../providers/waba/send/reaction.js';
import { StandardizedSendReactionInput, StandardizedSendResponse } from './sendReaction.types.js';
import { ProviderConfig } from '../../index.types.js';

// Main standardization function that detects provider and routes accordingly
export const standardizeSendReaction = async (
  input: StandardizedSendReactionInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Route to appropriate provider based on provider type
  switch (config.selectedProvider) {
    case 'whatsapp':
      return await sendReactionWaba(input, config);
    
    case 'evolutionAPI':
      // TODO: Implement Evolution API reaction sending
      return {
        success: false,
        error: {
          message: `Evolution API reaction sending not implemented yet`,
          code: 'NOT_IMPLEMENTED'
        }
      };
    
    // Future providers can be added here
    // case 'telegram':
    //   return sendReactionTelegram(input, config);
    // case 'discord':
    //   return sendReactionDiscord(input, config);
    
    default:
      return {
        success: false,
        error: {
          message: `Unsupported messaging provider: ${(config as any).selectedProvider}`,
          code: 'UNSUPPORTED_PROVIDER'
        }
      };
  }
};
