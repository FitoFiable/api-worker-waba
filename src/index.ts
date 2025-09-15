import { Hono } from 'hono'
import { Bindings } from './bindings.js'
import { MessageProvider } from './messagingService/index.js'
import { dummyTestMessages } from './dummyTestMessages.js'
import { handleEvolutionAPIMessage } from './handleEvolutionAPIMessage.js'
import messageRoutes from './messageRoutes.js'

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

    // Get the messaging service from context
    const messagingService = c.get('messagingService');

    // Process the message in the background using context.waitUntil
    c.executionCtx.waitUntil(
      handleEvolutionAPIMessage(payload, messagingService, c.env.API_CORE_URL)
        .catch(error => {
          console.error('Background message processing failed:', error);
        })
    );

    // Return immediately to acknowledge the webhook
    return c.json({ message: "Webhook received and processing started" });
  } catch (error) {
    console.error('Error processing Evolution API webhook:', error);
    return c.json({ error: "Failed to process webhook" }, 500);
  }
})


// Mount message sending routes
app.route('/messages', messageRoutes)

// Mount dummy test messages routes
app.route('/', dummyTestMessages)




export default app

