import { Context } from 'hono'
import { Bindings } from './bindings.js'
import { MessageProvider } from './messagingService/index.js'



// Helper function to send standardized message to core API
async function sendToCoreAPI(standardizedMessage: any, receiverID: string, coreApiUrl: string): Promise<void> {
  try {
    const response = await fetch(`${coreApiUrl}/eventHandler/standarizedInput`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(standardizedMessage)
    });

    if (!response.ok) {
      throw new Error(`Core API responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Core API response:', result);
  } catch (error) {
    console.error('Error sending to core API:', error);
    throw error;
  }
}

export async function handleEvolutionAPIMessage(
  payload: any,
  messagingService: MessageProvider,
  coreApiUrl?: string
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
          
          console.log('Standardized message:', standardizedMessage);
          
          if (standardizedMessage && "messageType" in standardizedMessage) {
            // Send to core API if URL is provided
            if (coreApiUrl) {
              await sendToCoreAPI(standardizedMessage, senderId, coreApiUrl);
            } else {
              // Log that no core API URL is provided - message processing should be handled by core API
              console.log('No core API URL provided - message will not be processed');
              console.log('Standardized message:', standardizedMessage);
            }
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
