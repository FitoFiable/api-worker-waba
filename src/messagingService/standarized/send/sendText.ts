// Main messaging provider send standardization switch
import { sendTextWaba } from '../../providers/waba/send/text.js';
import { StandardizedSendTextInput, StandardizedSendResponse } from './sendText.types.js';
import { ProviderConfig, providers } from '../../index.types.js';

// Main standardization function that detects provider and routes accordingly
export const standardizeSendText = async (
  input: StandardizedSendTextInput,
  config?: ProviderConfig,
  provider?: providers
): Promise<StandardizedSendResponse> => {
  // Route to appropriate provider based on provider type
  switch (provider) {
    case 'whatsapp':
      return await sendTextWaba(input, config || {});
    
    // Future providers can be added here
    // case 'telegram':
    //   return sendTextTelegram(input, config);
    // case 'discord':
    //   return sendTextDiscord(input, config);
    
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
