// Main messaging provider send sticker standardization switch
import { sendStickerWaba } from '../../providers/waba/send/sticker.js';
import { sendStickerEvolutionAPI } from '../../providers/evolutionAPI/send/sticker.js';
import { StandardizedSendStickerInput, StandardizedSendResponse } from './sendTypes.js';
import { ProviderConfig } from '../../index.types.js';

// Main standardization function that detects provider and routes accordingly
export const standardizeSendSticker = async (
  input: StandardizedSendStickerInput,
  config: ProviderConfig
): Promise<StandardizedSendResponse> => {
  // Route to appropriate provider based on provider type
  switch (config.selectedProvider) {
    case 'whatsapp':
      return await sendStickerWaba(input, config);
    
    case 'evolutionAPI':
      return await sendStickerEvolutionAPI(input, config);
    
    // Future providers can be added here
    // case 'telegram':
    //   return sendStickerTelegram(input, config);
    // case 'discord':
    //   return sendStickerDiscord(input, config);
    
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