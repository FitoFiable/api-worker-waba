import { EvolutionAPIImageMessage } from "../standarizerInput.types.js";
import { ImageToTextService } from "@/messagingService/services/image_to_text/index.js";
import { ProviderConfig } from "@/messagingService/index.types.js";
import { isEvolutionAPIConfig } from "../validation.js";

export async function imageInputToText(image: EvolutionAPIImageMessage, config: ProviderConfig): Promise<string> {
    // Validate that config is for Evolution API
    if (!isEvolutionAPIConfig(config)) {
      console.warn('Invalid configuration: expected Evolution API provider, skipping image text extraction');
      return "No text detected: Error 1";
    }

    const imageMessage = image as EvolutionAPIImageMessage;
      
    // Check if we have the required configuration for image processing
    if (!config?.awsCredentials) {
      console.warn('AWS credentials not provided, skipping image text extraction');
      return "No text detected: Error 1";
    }
    
    // Initialize image-to-text service with AWS Textract
    const imageToText = new ImageToTextService({
      method: 'AWS_TEXTRACT',
      awsTextractConfig: config.awsCredentials
    });

    try {
      // Check if we have a URL to process
      if (!imageMessage.imageMessage.url) {
        console.warn('No image URL available for processing');
        return "No text detected: Error 2";
      }

      // Download the image directly from the URL
      const mediaResponse = await fetch(imageMessage.imageMessage.url);

      if (!mediaResponse.ok) {
        throw new Error(`Failed to download image: ${mediaResponse.statusText}`);
      }

      const imageBuffer = await mediaResponse.arrayBuffer();
      
      // Extract text from image using AWS Textract
      const extractedText = await imageToText.convertImageToText(imageBuffer, 'AWS_TEXTRACT');
      
      console.log('Extracted text:', extractedText);
      // Use extracted text, image caption, or fallback to image ID
      return extractedText || "No text detected: Error 3";
    } catch (error) {
      console.error('Error processing image:', error);
      // Fallback to caption or image ID if processing fails
      return imageMessage.imageMessage.caption || "No text detected: Error 4";
    }
}
