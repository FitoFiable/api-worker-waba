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
    console.log('Evolution API Webhook received:', JSON.stringify(payload, null, 2));

    // Check if it's a message event
    if (payload.event === 'messages.upsert') {
      const messageData = payload.data;
      
      // Check if message is from someone else (not from us)
      if (!messageData.key.fromMe) {
        const senderId = messageData.key.remoteJid.replace('@s.whatsapp.net', '');
        
        console.log(`📨 Received message from ${messageData.pushName} (${senderId})`);
        console.log(`📝 Message content:`, messageData.message);
        
        // Standardize the message using our messaging service
        const standardizedMessages = await c.get('messagingService').standarizeInput({
          message: messageData.message,
          receiverID: senderId
        }, messageData.contextInfo);
        
        if (standardizedMessages && standardizedMessages.length > 0) {
          const standardizedMessage = standardizedMessages[0];
          console.log('✅ Standardized message:', JSON.stringify(standardizedMessage, null, 2));
          
          // Here you can add your business logic to handle the received message
          // For example: save to database, trigger workflows, etc.
          
          // Example: Echo back the message
          if (standardizedMessage?.messageType === 'text') {
            console.log(`🔄 Echoing back: "Echo: ${standardizedMessage.content}"`);
            await c.get('messagingService').sendText({
              to: senderId,
              message: `Echo: ${standardizedMessage.content}`
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

