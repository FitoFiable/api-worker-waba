// Main messaging provider standardization switch
import { standardizeWabaMessage } from '../../providers/waba/index.js';
import { StandardizedMessage } from './standarizeMessageReceived.types.js';
import { ProviderConfig } from '../../index.types.js';




// Single message standardization function
export const standardizeSingleMessage = async (
  message: any,
  receiverID: string,
  config: ProviderConfig
): Promise<StandardizedMessage | null> => {
  // Route to appropriate provider based on provider type
  switch (config.selectedProvider) {
    case 'whatsapp':
      return await standardizeWabaMessage(message, receiverID, config);
    
    case 'evolutionAPI':
      // TODO: Implement Evolution API message standardization
      console.warn(`Evolution API message standardization not implemented yet`);
      return null;
    
    // Future providers can be added here
    // case 'telegram':
    //   return standardizeTelegramSingleMessage(message, receiverID, config);
    // case 'discord':
    //   return standardizeDiscordSingleMessage(message, receiverID, config);
    
    default:
      console.warn(`Unsupported messaging provider: ${(config as any).selectedProvider}`);
      return null;
  }
};

