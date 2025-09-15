import { Hono } from 'hono'
import { Bindings } from './bindings.js'
import { MessageProvider } from './messagingService/index.js'

type Variables = {
  messagingService: MessageProvider
}

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// Validation helper
const validateDestination = (to: string): boolean => {
  // Basic validation for phone number format
  // WhatsApp format: country code + number (e.g., 1234567890)
  const phoneRegex = /^\d{10,15}$/
  return phoneRegex.test(to.replace(/\D/g, ''))
}

// Send text message
app.post('/send/text', async (c) => {
  try {
    const body = await c.req.json()
    const { to, message, replyToMessageId } = body

    // Validation
    if (!to || !message) {
      return c.json({ error: 'Missing required fields: to, message' }, 400)
    }

    if (!validateDestination(to)) {
      return c.json({ error: 'Invalid destination format. Must be a valid phone number.' }, 400)
    }

    const messagingService = c.get('messagingService')
    const result = await messagingService.sendText({
      to,
      message,
      replyToMessageId
    })

    return c.json({ 
      success: true, 
      message: 'Text message sent successfully',
      data: result 
    })
  } catch (error) {
    console.error('Error sending text message:', error)
    return c.json({ error: 'Failed to send text message' }, 500)
  }
})

// Send image message
app.post('/send/image', async (c) => {
  try {
    const body = await c.req.json()
    const { to, imageUrl, imageId, caption, replyToMessageId } = body

    // Validation
    if (!to) {
      return c.json({ error: 'Missing required field: to' }, 400)
    }

    if (!imageUrl && !imageId) {
      return c.json({ error: 'Either imageUrl or imageId is required' }, 400)
    }

    if (!validateDestination(to)) {
      return c.json({ error: 'Invalid destination format. Must be a valid phone number.' }, 400)
    }

    const messagingService = c.get('messagingService')
    const result = await messagingService.sendImage({
      to,
      imageUrl,
      imageId,
      caption,
      replyToMessageId
    })

    return c.json({ 
      success: true, 
      message: 'Image message sent successfully',
      data: result 
    })
  } catch (error) {
    console.error('Error sending image message:', error)
    return c.json({ error: 'Failed to send image message' }, 500)
  }
})

// Send sticker message
app.post('/send/sticker', async (c) => {
  try {
    const body = await c.req.json()
    const { to, stickerUrl, stickerId, replyToMessageId } = body

    // Validation
    if (!to) {
      return c.json({ error: 'Missing required field: to' }, 400)
    }

    if (!stickerUrl && !stickerId) {
      return c.json({ error: 'Either stickerUrl or stickerId is required' }, 400)
    }

    if (!validateDestination(to)) {
      return c.json({ error: 'Invalid destination format. Must be a valid phone number.' }, 400)
    }

    const messagingService = c.get('messagingService')
    const result = await messagingService.sendSticker({
      to,
      stickerUrl,
      stickerId,
      replyToMessageId
    })

    return c.json({ 
      success: true, 
      message: 'Sticker message sent successfully',
      data: result 
    })
  } catch (error) {
    console.error('Error sending sticker message:', error)
    return c.json({ error: 'Failed to send sticker message' }, 500)
  }
})

// Send reaction message
app.post('/send/reaction', async (c) => {
  try {
    const body = await c.req.json()
    const { to, emoji, messageId } = body

    // Validation
    if (!to || !emoji || !messageId) {
      return c.json({ error: 'Missing required fields: to, emoji, messageId' }, 400)
    }

    if (!validateDestination(to)) {
      return c.json({ error: 'Invalid destination format. Must be a valid phone number.' }, 400)
    }

    const messagingService = c.get('messagingService')
    const result = await messagingService.sendReaction({
      to,
      emoji,
      messageId
    })

    return c.json({ 
      success: true, 
      message: 'Reaction sent successfully',
      data: result 
    })
  } catch (error) {
    console.error('Error sending reaction:', error)
    return c.json({ error: 'Failed to send reaction' }, 500)
  }
})

// Send list single select message
app.post('/send/list', async (c) => {
  try {
    const body = await c.req.json()
    const { to, headerText, bodyText, footerText, buttonText, sections, replyToMessageId } = body

    // Validation
    if (!to || !headerText || !bodyText || !buttonText || !sections) {
      return c.json({ 
        error: 'Missing required fields: to, headerText, bodyText, buttonText, sections' 
      }, 400)
    }

    if (!Array.isArray(sections) || sections.length === 0) {
      return c.json({ error: 'Sections must be a non-empty array' }, 400)
    }

    // Validate sections structure
    for (const section of sections) {
      if (!section.title || !Array.isArray(section.items) || section.items.length === 0) {
        return c.json({ 
          error: 'Each section must have a title and non-empty items array' 
        }, 400)
      }
      
      for (const item of section.items) {
        if (!item.id || !item.title) {
          return c.json({ 
            error: 'Each item must have an id and title' 
          }, 400)
        }
      }
    }

    if (!validateDestination(to)) {
      return c.json({ error: 'Invalid destination format. Must be a valid phone number.' }, 400)
    }

    const messagingService = c.get('messagingService')
    const result = await messagingService.sendListSingleSelect({
      to,
      headerText,
      bodyText,
      footerText,
      buttonText,
      sections,
      replyToMessageId
    })

    return c.json({ 
      success: true, 
      message: 'List message sent successfully',
      data: result 
    })
  } catch (error) {
    console.error('Error sending list message:', error)
    return c.json({ error: 'Failed to send list message' }, 500)
  }
})

// Health check for message routes
app.get('/health', async (c) => {
  return c.json({ 
    success: true, 
    message: 'Message routes are healthy',
    availableEndpoints: [
      'POST /send/text',
      'POST /send/image', 
      'POST /send/sticker',
      'POST /send/reaction',
      'POST /send/list'
    ]
  })
})

export default app
