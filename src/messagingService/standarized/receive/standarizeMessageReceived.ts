// Main messaging provider standardization switch
import { standardizeWabaMessage } from '../../providers/waba/index.js';
import { StandardizedMessage } from './standarizeMessageReceived.types.js';
import { ProviderConfig, providers } from '../../index.types.js';




// Single message standardization function
export const standardizeSingleMessage = async (
  message: any,
  receiverID: string,
  config?: ProviderConfig,
  provider?: providers
): Promise<StandardizedMessage | null> => {
  // Route to appropriate provider based on provider type
  switch (provider) {
    case 'whatsapp':
      return await standardizeWabaMessage(message, receiverID, config);
    
    // Future providers can be added here
    // case 'telegram':
    //   return standardizeTelegramSingleMessage(message, receiverID, config);
    // case 'discord':
    //   return standardizeDiscordSingleMessage(message, receiverID, config);
    
    default:
      console.warn(`Unsupported messaging provider: ${provider}`);
      return null;
  }
};

