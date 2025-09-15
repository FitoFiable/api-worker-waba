import { Context } from 'hono'
import { Bindings } from './bindings.js'
import { MessageProvider } from './messagingService/index.js'

type Variables = {
  messagingService: MessageProvider
}

export async function handleEvolutionAPIMessage(
  payload: any,
  messagingService: MessageProvider
): Promise<void> {
  try {
    console.log("Processing Evolution API message:", payload);

    // Check if it's a message event
    if (payload.event === 'messages.upsert') {
      const messageData = payload.data;
      
      // Check if message is from someone else (not from us)
      if (!messageData.key.fromMe) {
        const senderId = messageData.key.remoteJid.replace('@s.whatsapp.net', '');
       
        // Standardize the message using our messaging service
        const standardizedMessages = await messagingService.standarizeInput({
          message: messageData.message,
          receiverID: senderId
        }, messageData);
        
        if (standardizedMessages && standardizedMessages.length > 0) {
          const standardizedMessage = standardizedMessages[0];
          
          // Example: Echo back the message
          console.log(standardizedMessage)
          if (standardizedMessage && "messageType" in standardizedMessage) {
            await messagingService.sendText({
              to: senderId,
              message: `Echo: ${standardizedMessage.messageType} - ${standardizedMessage.associatedMediaUrl} : ${standardizedMessage.content}`
            });
          }
        } else {
          console.log('❌ Failed to standardize message');
        }
      } else {
        console.log('📤 Ignoring message from ourselves');
      }
    }
  } catch (error) {
    console.error('Error processing Evolution API message:', error);
    throw error; // Re-throw to be handled by the caller
  }
}
