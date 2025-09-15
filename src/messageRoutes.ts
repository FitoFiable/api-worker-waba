import { Hono } from 'hono'
import { Bindings } from './bindings.js'
import { MessageProvider } from './messagingService/index.js'
import type { sendAnyAvailableType } from './messagingService/standarized/send/sendTypes.js'

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


// Send many (batch)
app.post('/sendMany', async (c) => {
  try {
    const body = await c.req.json()
    console.log("--- sendMany ---")
    console.log('Body:', body)
    const messages: sendAnyAvailableType[] | undefined = Array.isArray(body)
      ? body
      : Array.isArray(body?.messages)
        ? body.messages
        : undefined

    if (!messages || messages.length === 0) {
      return c.json({ error: 'Request must be a non-empty array of messages or an object with messages: []' }, 400)
    }

    const messagingService = c.get('messagingService')

    const results = []
    for (let index = 0; index < messages.length; index++) {
      const msg = messages[index]
      
      if (!msg?.to || !validateDestination(msg.to)) {
        results.push({
          index,
          type: 'unknown', 
          success: false,
          error: { message: 'Invalid or missing destination' }
        })
        continue
      }

      // Decide which sender to use based on discriminative fields
      const isText = typeof (msg as any).message === 'string' && !('emoji' in (msg as any))
      const isReaction = 'emoji' in (msg as any) && 'messageId' in (msg as any)
      const isImage = 'imageUrl' in (msg as any) || 'imageId' in (msg as any)
      const isSticker = 'stickerUrl' in (msg as any) || 'stickerId' in (msg as any)
      const isList = 'headerText' in (msg as any) && 'bodyText' in (msg as any) && 'buttonText' in (msg as any) && 'sections' in (msg as any)

      let type: string = 'unknown'
      let data: any

      try {
        if (isText) {
          type = 'text'
          data = await messagingService.sendText(msg as any)
        } else if (isImage) {
          type = 'image'
          data = await messagingService.sendImage(msg as any)
        } else if (isSticker) {
          type = 'sticker'
          console.log('Sending sticker')
          console.log(msg)
          data = await messagingService.sendSticker(msg as any)
          console.log('Sticker sent')
          console.log(data)
          console.log('--------------------------------')
        } else if (isReaction) {
          type = 'reaction'
          data = await messagingService.sendReaction(msg as any)
        } else if (isList) {
          type = 'list'
          data = await messagingService.sendListSingleSelect(msg as any)
        } else {
          results.push({
            index,
            type,
            success: false,
            error: { message: 'Unable to determine message type from payload' }
          })
          continue
        }

        results.push({ index, type, success: true, data })
      } catch (error) {
        results.push({
          index,
          type,
          success: false,
          error: { message: String(error) }
        })
      }
    }

    const normalizedResults = results.map((res) =>
      res.success ? res : { success: false, error: { message: String(res.error) } }
    )

    const hasFailures = normalizedResults.some((r: any) => !r.success)

    return c.json({
      success: !hasFailures,
      message: hasFailures ? 'Completed with some failures' : 'All messages sent successfully',
      results: normalizedResults
    })
  } catch (error) {
    console.error('Error in /sendMany:', error)
    return c.json({ error: 'Failed to process batch send' }, 500)
  }
})



export default app


// // Send text message
// app.post('/send/text', async (c) => {
//   try {
//     const body = await c.req.json()
//     const { to, message, replyToMessageId } = body

//     // Validation
//     if (!to || !message) {
//       return c.json({ error: 'Missing required fields: to, message' }, 400)
//     }

//     if (!validateDestination(to)) {
//       return c.json({ error: 'Invalid destination format. Must be a valid phone number.' }, 400)
//     }

//     const messagingService = c.get('messagingService')
//     const result = await messagingService.sendText({
//       to,
//       message,
//       replyToMessageId
//     })

//     return c.json({ 
//       success: true, 
//       message: 'Text message sent successfully',
//       data: result 
//     })
//   } catch (error) {
//     console.error('Error sending text message:', error)
//     return c.json({ error: 'Failed to send text message' }, 500)
//   }
// })

// // Send image message
// app.post('/send/image', async (c) => {
//   try {
//     const body = await c.req.json()
//     const { to, imageUrl, imageId, caption, replyToMessageId } = body

//     // Validation
//     if (!to) {
//       return c.json({ error: 'Missing required field: to' }, 400)
//     }

//     if (!imageUrl && !imageId) {
//       return c.json({ error: 'Either imageUrl or imageId is required' }, 400)
//     }

//     if (!validateDestination(to)) {
//       return c.json({ error: 'Invalid destination format. Must be a valid phone number.' }, 400)
//     }

//     const messagingService = c.get('messagingService')
//     const result = await messagingService.sendImage({
//       to,
//       imageUrl,
//       imageId,
//       caption,
//       replyToMessageId
//     })

//     return c.json({ 
//       success: true, 
//       message: 'Image message sent successfully',
//       data: result 
//     })
//   } catch (error) {
//     console.error('Error sending image message:', error)
//     return c.json({ error: 'Failed to send image message' }, 500)
//   }
// })

// // Send sticker message
// app.post('/send/sticker', async (c) => {
//   try {
//     const body = await c.req.json()
//     const { to, stickerUrl, stickerId, replyToMessageId } = body

//     // Validation
//     if (!to) {
//       return c.json({ error: 'Missing required field: to' }, 400)
//     }

//     if (!stickerUrl && !stickerId) {
//       return c.json({ error: 'Either stickerUrl or stickerId is required' }, 400)
//     }

//     if (!validateDestination(to)) {
//       return c.json({ error: 'Invalid destination format. Must be a valid phone number.' }, 400)
//     }

//     const messagingService = c.get('messagingService')
//     const result = await messagingService.sendSticker({
//       to,
//       stickerUrl,
//       stickerId,
//       replyToMessageId
//     })

//     return c.json({ 
//       success: true, 
//       message: 'Sticker message sent successfully',
//       data: result 
//     })
//   } catch (error) {
//     console.error('Error sending sticker message:', error)
//     return c.json({ error: 'Failed to send sticker message' }, 500)
//   }
// })

// // Send reaction message
// app.post('/send/reaction', async (c) => {
//   try {
//     const body = await c.req.json()
//     const { to, emoji, messageId } = body

//     // Validation
//     if (!to || !emoji || !messageId) {
//       return c.json({ error: 'Missing required fields: to, emoji, messageId' }, 400)
//     }

//     if (!validateDestination(to)) {
//       return c.json({ error: 'Invalid destination format. Must be a valid phone number.' }, 400)
//     }

//     const messagingService = c.get('messagingService')
//     const result = await messagingService.sendReaction({
//       to,
//       emoji,
//       messageId
//     })

//     return c.json({ 
//       success: true, 
//       message: 'Reaction sent successfully',
//       data: result 
//     })
//   } catch (error) {
//     console.error('Error sending reaction:', error)
//     return c.json({ error: 'Failed to send reaction' }, 500)
//   }
// })

// // Send list single select message
// app.post('/send/list', async (c) => {
//   try {
//     const body = await c.req.json()
//     const { to, headerText, bodyText, footerText, buttonText, sections, replyToMessageId } = body

//     // Validation
//     if (!to || !headerText || !bodyText || !buttonText || !sections) {
//       return c.json({ 
//         error: 'Missing required fields: to, headerText, bodyText, buttonText, sections' 
//       }, 400)
//     }

//     if (!Array.isArray(sections) || sections.length === 0) {
//       return c.json({ error: 'Sections must be a non-empty array' }, 400)
//     }

//     // Validate sections structure
//     for (const section of sections) {
//       if (!section.title || !Array.isArray(section.items) || section.items.length === 0) {
//         return c.json({ 
//           error: 'Each section must have a title and non-empty items array' 
//         }, 400)
//       }
      
//       for (const item of section.items) {
//         if (!item.id || !item.title) {
//           return c.json({ 
//             error: 'Each item must have an id and title' 
//           }, 400)
//         }
//       }
//     }

//     if (!validateDestination(to)) {
//       return c.json({ error: 'Invalid destination format. Must be a valid phone number.' }, 400)
//     }

//     const messagingService = c.get('messagingService')
//     const result = await messagingService.sendListSingleSelect({
//       to,
//       headerText,
//       bodyText,
//       footerText,
//       buttonText,
//       sections,
//       replyToMessageId
//     })

//     return c.json({ 
//       success: true, 
//       message: 'List message sent successfully',
//       data: result 
//     })
//   } catch (error) {
//     console.error('Error sending list message:', error)
//     return c.json({ error: 'Failed to send list message' }, 500)
//   }
// })

