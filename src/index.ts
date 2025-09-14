import { Hono } from 'hono'
import { Bindings } from './bindings.js'
import { MessageProvider } from './messagingService/index.js'
import { dummyTestMessages } from './dummyTestMessages.js'

type Variables = {
  messagingService: MessageProvider
}

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()


// Middleware to inject providers
app.use('*', async (c, next) => {
  // Create messaging provider with environment variables
  const messagingProvider = new MessageProvider({
    cloudflareCredentials: {
      accountId: c.env.CLOUDFLARE_ACCOUNT_ID,
      apiToken: c.env.CLOUDFLARE_API_TOKEN,
    },
    awsCredentials: {
      accessKey: c.env.AWS_ACCESS_KEY,
      secretKey: c.env.AWS_SECRET_KEY,
    },
    evolutionAPIUrl: c.env.EVOLUTION_API_URL,
    evolutionAPIKey: c.env.EVOLUTION_API_KEY,
    evolutionInstanceId: c.env.EVOLUTION_INSTANCE_ID,
    selectedProvider: 'evolutionAPI',
    uploadFileEndpoint: c.env.API_CORE_URL + '/media/upload'
  });
  
  // Extend context with providers
  c.set('messagingService', messagingProvider);
  
  await next();
});



app.get("/", async (c) => {
  return c.json({ message: "API funcionando correctamente" })
})


app.post("/webhook-evolution-api", async (c) => {
  try {
    // Get the webhook payload
    const payload = await c.req.json();
    console.log("payload:", payload)

    // Check if it's a message event
    if (payload.event === 'messages.upsert') {
      const messageData = payload.data;
      
      // Check if message is from someone else (not from us)
      if (!messageData.key.fromMe) {
        const senderId = messageData.key.remoteJid.replace('@s.whatsapp.net', '');
       
        // Standardize the message using our messaging service
        const standardizedMessages = await c.get('messagingService').standarizeInput({
          message: messageData.message,
          receiverID: senderId
        }, messageData);
        
        if (standardizedMessages && standardizedMessages.length > 0) {
          const standardizedMessage = standardizedMessages[0];
          
          // Example: Echo back the message
          console.log(standardizedMessage)
          if (standardizedMessage && "messageType" in standardizedMessage) {
            await c.get('messagingService').sendText({
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

    return c.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error('Error processing Evolution API webhook:', error);
    return c.json({ error: "Failed to process webhook" }, 500);
  }
})


// Mount dummy test messages routes
app.route('/', dummyTestMessages)




export default app

