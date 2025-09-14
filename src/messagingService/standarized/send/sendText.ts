// Main messaging provider send standardization switch
import { sendTextWaba } from '../../providers/waba/send/text.js';
import { sendTextEvolutionAPI } from '../../providers/evolutionAPI/send/text.js';
import { StandardizedSendTextInput, StandardizedSendResponse } from './sendText.types.js';
import { ProviderConfig } from '../../index.types.js';

// Main standardization function that detects provider and routes accordingly
export const standardizeSendText = async (
  input: StandardizedSendTextInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Route to appropriate provider based on provider type
  switch (config.selectedProvider) {
    case 'whatsapp':
      return await sendTextWaba(input, config);
    
    case 'evolutionAPI':
      return await sendTextEvolutionAPI(input, config);
    
    // Future providers can be added here
    // case 'telegram':
    //   return sendTextTelegram(input, config);
    // case 'discord':
    //   return sendTextDiscord(input, config);
    
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
