import { WhatsAppImageMessage } from "../standarizerInput.types.js";
import { ImageToTextService } from "@/messagingService/services/image_to_text/index.js";
import { ProviderConfig } from "@/messagingService/index.types.js";
import { isWabaConfig } from "../validation.js";

export async function imageInputToText(image: WhatsAppImageMessage, config: ProviderConfig): Promise<string> {
    // Validate that config is for WABA
    if (!isWabaConfig(config)) {
      console.warn('Invalid configuration: expected WABA provider, skipping image text extraction');
      return "No text detected: Error 1";
    }

    const imageMessage = image as WhatsAppImageMessage;
      
    // Check if we have the required configuration for image processing
    if (!config?.whatsappToken) {
      console.warn('WhatsApp token not provided, skipping image text extraction');
      return "No text detected: Error 1";
    }
    
    // Initialize image-to-text service with AWS Textract
    const imageToText = new ImageToTextService({
      method: 'AWS_TEXTRACT',
      awsTextractConfig: config?.awsCredentials
    });

    try {
      // 1. Get image URL from WhatsApp Graph API
      const imageResponse = await fetch(
        `https://graph.facebook.com/v18.0/${imageMessage.image.id}`,
        {
          headers: { Authorization: `Bearer ${config.whatsappToken}` },
        }
      );

      if (!imageResponse.ok) {
        throw new Error(`Failed to get image URL: ${imageResponse.statusText}`);
      }

      const imageData = (await imageResponse.json()) as { url: string };

      // 2. Download the actual image
      const mediaResponse = await fetch(imageData.url, {
        headers: { Authorization: `Bearer ${config.whatsappToken}` },
      });

      if (!mediaResponse.ok) {
        throw new Error(`Failed to download image: ${mediaResponse.statusText}`);
      }

      const imageBuffer = await mediaResponse.arrayBuffer();
      
      // 3. Extract text from image using AWS Textract
      const extractedText = await imageToText.convertImageToText(imageBuffer, 'AWS_TEXTRACT');
      
      console.log('Extracted text:', extractedText);
      // Use extracted text, image caption, or fallback to image ID
      return extractedText || "No text detected: Error 2";
    } catch (error) {
      console.error('Error processing image:', error);
      // Fallback to caption or image ID if processing fails
      return "No text detected: Error 3";
    }
}