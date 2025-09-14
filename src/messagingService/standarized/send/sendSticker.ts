// Main messaging provider send sticker standardization switch
import { sendStickerWaba } from '../../providers/waba/send/sticker.js';
import { StandardizedSendStickerInput, StandardizedSendResponse } from './sendSticker.types.js';
import { ProviderConfig, providers } from '../../index.types.js';

// Main standardization function that detects provider and routes accordingly
export const standardizeSendSticker = async (
  input: StandardizedSendStickerInput,
  config?: ProviderConfig,
  provider?: providers
): Promise<StandardizedSendResponse> => {
  // Route to appropriate provider based on provider type
  switch (provider) {
    case 'whatsapp':
      return await sendStickerWaba(input, config || {});
    
    // Future providers can be added here
    // case 'telegram':
    //   return sendStickerTelegram(input, config);
    // case 'discord':
    //   return sendStickerDiscord(input, config);
    
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