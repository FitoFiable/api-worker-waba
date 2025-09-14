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
  const to = "573122779727" // Replace with your test number
  const results = []
  
  console.log("🚀 Starting Evolution API message testing...")
  console.log("📱 Target number:", to)
  
  try {
    // 1. Send Text Message
    console.log("\n" + "=".repeat(50))
    console.log("📝 [1/5] Sending TEXT MESSAGE...")
    console.log("📤 Payload:", { to, message: "🚀 Hello! This is a text message from Evolution API!" })
    
    const textResult = await c.get('messagingService').sendText({ 
      to, 
      message: "🚀 Hello! This is a text message from Evolution API!" 
    })
    
    console.log("📥 Text Result:", JSON.stringify(textResult, null, 2))
    results.push({ type: "Text Message", result: textResult })
    
    if (textResult.success) {
      console.log("✅ Text message sent successfully! Message ID:", textResult.messageId)
    } else {
      console.log("❌ Text message failed:", textResult.error?.message)
    }
    
    // 2. Send Image Message
    console.log("\n" + "=".repeat(50))
    console.log("🖼️ [2/5] Sending IMAGE MESSAGE...")
    const imagePayload = { 
      to, 
      imageUrl: "https://picsum.photos/400/300",
      caption: "📸 This is a test image message!"
    }
    console.log("📤 Payload:", imagePayload)
    
    const imageResult = await c.get('messagingService').sendImage(imagePayload)
    
    console.log("📥 Image Result:", JSON.stringify(imageResult, null, 2))
    results.push({ type: "Image Message", result: imageResult })
    
    if (imageResult.success) {
      console.log("✅ Image message sent successfully! Message ID:", imageResult.messageId)
    } else {
      console.log("❌ Image message failed:", imageResult.error?.message)
    }
    
    // 3. Send Sticker Message
    console.log("\n" + "=".repeat(50))
    console.log("🎭 [3/5] Sending STICKER MESSAGE...")
    const stickerPayload = { 
      to, 
      stickerUrl: "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif"
    }
    console.log("📤 Payload:", stickerPayload)
    
    const stickerResult = await c.get('messagingService').sendSticker(stickerPayload)
    
    console.log("📥 Sticker Result:", JSON.stringify(stickerResult, null, 2))
    results.push({ type: "Sticker Message", result: stickerResult })
    
    if (stickerResult.success) {
      console.log("✅ Sticker message sent successfully! Message ID:", stickerResult.messageId)
    } else {
      console.log("❌ Sticker message failed:", stickerResult.error?.message)
    }
    
    // 4. Send List Single Select Message
    console.log("\n" + "=".repeat(50))
    console.log("📋 [4/5] Sending LIST MESSAGE...")
    const listPayload = { 
      to, 
      headerText: "Choose Option",
      bodyText: "Please select an option:",
      buttonText: "View Options",
      footerText: "Test List",
      sections: [
        {
          title: "Options",
          items: [
            { id: "option1", title: "Option 1", description: "First option" },
            { id: "option2", title: "Option 2", description: "Second option" },
            { id: "option3", title: "Option 3", description: "Third option" }
          ]
        }
      ]
    }
    console.log("📤 Payload:", JSON.stringify(listPayload, null, 2))
    
    const listResult = await c.get('messagingService').sendListSingleSelect(listPayload)
    
    console.log("📥 List Result:", JSON.stringify(listResult, null, 2))
    results.push({ type: "List Message", result: listResult })
    
    if (listResult.success) {
      console.log("✅ List message sent successfully! Message ID:", listResult.messageId)
    } else {
      console.log("❌ List message failed:", listResult.error?.message)
    }
    
    // 5. Send Reaction Message (if we have a previous message ID)
    if (textResult.success && textResult.messageId) {
      console.log("\n" + "=".repeat(50))
      console.log("😀 [5/5] Sending REACTION MESSAGE...")
      const reactionPayload = { 
        to, 
        emoji: "👍",
        messageId: textResult.messageId
      }
      console.log("📤 Payload:", reactionPayload)
      
      const reactionResult = await c.get('messagingService').sendReaction(reactionPayload)
      
      console.log("📥 Reaction Result:", JSON.stringify(reactionResult, null, 2))
      results.push({ type: "Reaction Message", result: reactionResult })
      
      if (reactionResult.success) {
        console.log("✅ Reaction message sent successfully! Message ID:", reactionResult.messageId)
      } else {
        console.log("❌ Reaction message failed:", reactionResult.error?.message)
      }
    } else {
      console.log("\n" + "=".repeat(50))
      console.log("😀 [5/5] SKIPPING REACTION MESSAGE...")
      console.log("⚠️ Reason: Text message failed or no message ID available")
      console.log("📊 Text result:", textResult)
    }
    
    // Summary
    console.log("\n" + "=".repeat(50))
    console.log("📊 FINAL SUMMARY:")
    console.log("📱 Total messages attempted:", results.length)
    const successful = results.filter(r => r.result.success).length
    const failed = results.filter(r => !r.result.success).length
    console.log("✅ Successful:", successful)
    console.log("❌ Failed:", failed)
    
    results.forEach((r, index) => {
      const status = r.result.success ? "✅" : "❌"
      console.log(`${status} [${index + 1}] ${r.type}: ${r.result.success ? r.result.messageId : r.result.error?.message}`)
    })
    
    // Return comprehensive results
    return c.json({ 
      message: "🎉 Evolution API message testing completed!", 
      totalSent: results.length,
      successful,
      failed,
      results: results.map(r => ({
        type: r.type,
        success: r.result.success,
        messageId: r.result.messageId,
        error: r.result.error?.message || null
      }))
    })
    
  } catch (error) {
    console.error("\n" + "=".repeat(50))
    console.error("❌ CRITICAL ERROR in message testing:")
    console.error("🔍 Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("📝 Error message:", error instanceof Error ? error.message : String(error))
    console.error("📚 Error stack:", error instanceof Error ? error.stack : "No stack available")
    console.error("📊 Results so far:", results.length)
    
    return c.json({ 
      error: "Failed to send messages", 
      details: error instanceof Error ? error.message : "Unknown error",
      totalAttempted: results.length,
      results: results.map(r => ({
        type: r.type,
        success: r.result.success,
        messageId: r.result.messageId,
        error: r.result.error?.message || null
      }))
    }, 500)
  }
})


app.get("/send-list-single-select", async (c) => {
  const to = "573122779727"
  const listPayload = {
    to,
    headerText: "🦥 Hi! I'm Fito, your personal financial assistant",
    bodyText: "I'm here to help you take control of your finances intelligently and without complications! What would you like to do today?",
    buttonText: "Let's Go!",
    footerText: "Fito Fiable - Your Smart Financial Partner 🦥💚",
    sections: [
      {
        title: "Choose an Option",
        items: [
          { id: "dashboard", title: "📊 Financial Dashboard", description: "Complete view of your financial health with insights and reports" },
          { id: "track_money", title: "💰 Track Money", description: "Add expenses, income, and import transactions from your bank" },
          { id: "goals", title: "🚀 Goals & Dreams", description: "Set goals, track progress, and get smart reminders" },
          { id: "shared_accounts", title: "👥 Shared Finances", description: "Manage money with family, roommates, and friends" },
          { id: "benefits", title: "🎁 Benefits & Savings", description: "Discover hidden discounts and perks you didn't know you had!" }
        ]
      },
      {
        title: "Help & Settings", 
        items: [
          { id: "about", title: "🦥 About Fito", description: "Learn what I can do and how to get started" },
          { id: "help", title: "💬 Help & Support", description: "Get help, tutorials, and support options" },
          { id: "settings", title: "⚙️ Settings & Profile", description: "Customize your experience, language, currency, and more" },
          { id: "send_feedback", title: "📝 Send Feedback", description: "Share your thoughts and suggestions with us" }
        ]
      }
    ]
  }
  const listResult = await c.get('messagingService').sendListSingleSelect(listPayload)
  return c.json({ message: "List single select sent successfully", data: listResult })
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

