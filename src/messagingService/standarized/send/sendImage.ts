// Main messaging provider send image standardization switch
import { sendImageWaba } from '../../providers/waba/send/image.js';
import { StandardizedSendImageInput, StandardizedSendResponse } from './sendImage.types.js';
import { ProviderConfig, providers } from '../../index.types.js';

// Main standardization function that detects provider and routes accordingly
export const standardizeSendImage = async (
  input: StandardizedSendImageInput,
  config?: ProviderConfig,
  provider?: providers
): Promise<StandardizedSendResponse> => {
  // Route to appropriate provider based on provider type
  switch (provider) {
    case 'whatsapp':
      return await sendImageWaba(input, config || {});
    
    // Future providers can be added here
    // case 'telegram':
    //   return sendImageTelegram(input, config);
    // case 'discord':
    //   return sendImageDiscord(input, config);
    
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
