import { standardizeSingleMessage } from "./standarized/receive/standarizeMessageReceived.js";
import { standardizeSendText } from "./standarized/send/sendText.js";
import { standardizeSendImage } from "./standarized/send/sendImage.js";
import { standardizeSendListSingleSelect } from "./standarized/send/sendListSingleSelect.js";
import { standardizeSendReaction } from "./standarized/send/sendReaction.js";
import { standardizeSendSticker } from "./standarized/send/sendSticker.js";
import type { MessagingProviderInput, ProviderConfig, StandardizedMessage } from "./index.types.js";
import type { StandardizedSendTextInput, StandardizedSendResponse } from "./standarized/send/sendText.types.js";
import type { StandardizedSendImageInput } from "./standarized/send/sendImage.types.js";
import type { StandardizedSendListSingleSelectInput } from "./standarized/send/sendListSingleSelect.types.js";
import type { StandardizedSendReactionInput } from "./standarized/send/sendReaction.types.js";
import type { StandardizedSendStickerInput } from "./standarized/send/sendSticker.types.js";

// Re-export all types
export * from "./index.types.js";
export * from "./standarized/send/sendCommon.types.js";
export * from "./standarized/send/sendText.types.js";
export * from "./standarized/send/sendImage.types.js";
export * from "./standarized/send/sendListSingleSelect.types.js";
export * from "./standarized/send/sendReaction.types.js";
export * from "./standarized/send/sendSticker.types.js";

export class MessageProvider {
  // Full provider configuration object
  private providerConfig: ProviderConfig;

  constructor( providerConfig: ProviderConfig) {
    this.providerConfig = providerConfig ;
  }

  async standarizeInput(inputReceived: MessagingProviderInput, fullMessageData?: any): Promise<StandardizedMessage[] | null> {
    // Handle single message input
    if ('message' in inputReceived && 'receiverID' in inputReceived) {
      const singleMessage = await standardizeSingleMessage(
        inputReceived.message, 
        inputReceived.receiverID,
        this.providerConfig,
        fullMessageData
      );
      return singleMessage ? [singleMessage] : null;
    }
    
    // Handle error responses
    if ('error' in inputReceived) {
      console.error('Messaging Provider Error:', inputReceived.error);
      return null;
    }
    
    console.warn('Unknown input type received');
    return null;
  }


  // Send text message
  async sendText(input: StandardizedSendTextInput): Promise<StandardizedSendResponse> {
    return standardizeSendText(input, this.providerConfig);
  }

  // Send image message
  async sendImage(input: StandardizedSendImageInput): Promise<StandardizedSendResponse> {
    return standardizeSendImage(input, this.providerConfig);
  }

  // Send list single select message
  async sendListSingleSelect(input: StandardizedSendListSingleSelectInput): Promise<StandardizedSendResponse> {
    return standardizeSendListSingleSelect(input, this.providerConfig);
  }

  // Send reaction message
  async sendReaction(input: StandardizedSendReactionInput): Promise<StandardizedSendResponse> {
    return standardizeSendReaction(input, this.providerConfig);
  }

  // Send sticker message
  async sendSticker(input: StandardizedSendStickerInput): Promise<StandardizedSendResponse> {
    return standardizeSendSticker(input, this.providerConfig);
  }
}
