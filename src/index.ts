import { Hono } from 'hono'
import { Bindings } from './bindings.js'
import { MessageProvider } from './messagingService/index.js'

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
app.get("/send-dummy-message", async (c) => {
  const { to, message } = { to: "573122779727", message: "Hola, este es un mensaje de prueba" }

  const evoBaseUrl = c.env.EVOLUTION_API_URL      // e.g. https://api.evolution-api.com
  const instanceId = c.env.EVOLUTION_INSTANCE_ID   // set in Wrangler secrets
  const apiKey = c.env.EVOLUTION_API_KEY           // set in Wrangler secrets

  console.log(`Sending message to ${evoBaseUrl}/message/sendText/${instanceId}`)
  const res = await fetch(
    `${evoBaseUrl}/message/sendText/${instanceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,   // required by Evolution API
      },
      body: JSON.stringify({
        number: to, // E.164 format without @ suffix
        text: message,
        delay: 500,
        linkPreview: false,
        mentionsEveryOne: false
      }),
    }
  )

  if (!res.ok) {
    return c.json({ error: await res.text() }, 500)
  }
  return c.json({ message: "Mensaje enviado correctamente", data: await res.json() })
})

app.get("/fetch-instances", async (c) => {
  const apiKey = c.env.EVOLUTION_API_KEY           // set in Wrangler secrets
  const evoBaseUrl = c.env.EVOLUTION_API_URL      // e.g. https://api.evolution-api.com

  console.log(`Fetching instances from ${evoBaseUrl}/instance/fetchInstances`)
  const res = await fetch(
    `${evoBaseUrl}/instance/fetchInstances`,
    {
      method: 'GET',
      headers: {
        'apikey': apiKey,   // required by Evolution API
      },
    }
  )

  if (!res.ok) {
    return c.json({ error: await res.text() }, 500)
  }
  return c.json({ message: "Instances fetched successfully", data: await res.json() })
})


export default app

