// Main messaging provider standardization switch
import { standardizeWabaMessage } from '../../providers/waba/index.js';
import { standardizeEvolutionAPIMessage } from '../../providers/evolutionAPI/index.js';
import { StandardizedMessage } from './standarizeMessageReceived.types.js';
import { ProviderConfig } from '../../index.types.js';




// Single message standardization function
export const standardizeSingleMessage = async (
  message: any,
  receiverID: string,
  config: ProviderConfig,
  contextInfo?: any
): Promise<StandardizedMessage | null> => {
  // Route to appropriate provider based on provider type
  switch (config.selectedProvider) {
    case 'whatsapp':
      return await standardizeWabaMessage(message, receiverID, config);
    
    case 'evolutionAPI':
      return await standardizeEvolutionAPIMessage(message, receiverID, config, contextInfo);
    
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

