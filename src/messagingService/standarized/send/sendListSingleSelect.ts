// Main messaging provider send list single select standardization switch
import { sendListSingleSelectWaba } from '../../providers/waba/send/listSingleSelect.js';
import { sendListSingleSelectEvolutionAPI } from '../../providers/evolutionAPI/send/listSingleSelect.js';
import { StandardizedSendListSingleSelectInput, StandardizedSendResponse } from './sendListSingleSelect.types.js';
import { ProviderConfig } from '../../index.types.js';

// Main standardization function that detects provider and routes accordingly
export const standardizeSendListSingleSelect = async (
  input: StandardizedSendListSingleSelectInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Route to appropriate provider based on provider type
  switch (config.selectedProvider) {
    case 'whatsapp':
      return await sendListSingleSelectWaba(input, config);
    
    case 'evolutionAPI':
      return await sendListSingleSelectEvolutionAPI(input, config);
    
    // Future providers can be added here
    // case 'telegram':
    //   return sendListSingleSelectTelegram(input, config);
    // case 'discord':
    //   return sendListSingleSelectDiscord(input, config);
    
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
