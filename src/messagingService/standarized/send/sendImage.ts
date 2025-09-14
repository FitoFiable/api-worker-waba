// Main messaging provider send image standardization switch
import { sendImageWaba } from '../../providers/waba/send/image.js';
import { StandardizedSendImageInput, StandardizedSendResponse } from './sendImage.types.js';
import { ProviderConfig } from '../../index.types.js';

// Main standardization function that detects provider and routes accordingly
export const standardizeSendImage = async (
  input: StandardizedSendImageInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Route to appropriate provider based on provider type
  switch (config.selectedProvider) {
    case 'whatsapp':
      return await sendImageWaba(input, config);
    
    case 'evolutionAPI':
      // TODO: Implement Evolution API image sending
      return {
        success: false,
        error: {
          message: `Evolution API image sending not implemented yet`,
          code: 'NOT_IMPLEMENTED'
        }
      };
    
    // Future providers can be added here
    // case 'telegram':
    //   return sendImageTelegram(input, config);
    // case 'discord':
    //   return sendImageDiscord(input, config);
    
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
