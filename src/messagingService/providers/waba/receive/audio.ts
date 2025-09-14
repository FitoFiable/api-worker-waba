import { WhatsAppAudioMessage } from "../standarizerInput.types.js";
import { AudioToTextService } from "@/messagingService/services/audio_to_text/index.js";
import { ProviderConfig } from "@/messagingService/index.types.js";
import { isWabaConfig } from "../validation.js";

export async function audioInputToText(audio: WhatsAppAudioMessage, config: ProviderConfig): Promise<string> {
    // Validate that config is for WABA
    if (!isWabaConfig(config)) {
      console.warn('Invalid configuration: expected WABA provider, skipping audio text extraction');
      return "No speech detected: Error 1";
    }

    const audioMessage = audio as WhatsAppAudioMessage;
      
    // Check if we have the required configuration for audio processing
    if (!config?.whatsappToken) {
      console.warn('WhatsApp token not provided, skipping audio text extraction');
      return "No speech detected: Error 1";
    }

    if (!config?.cloudflareCredentials) {
      console.warn('Cloudflare credentials not provided, skipping audio text extraction');
      return "No speech detected: Error 2";
    }
    
    // Initialize audio-to-text service with Cloudflare Whisper
    const audioToText = new AudioToTextService({
      method: 'CLOUDFLARE_WHISPER',
      cloudflareWhisperConfig: {
        accountId: config.cloudflareCredentials.accountId,
        apiToken: config.cloudflareCredentials.apiToken
      }
    });

    try {
      // 1. Get audio URL from WhatsApp Graph API
      const audioResponse = await fetch(
        `https://graph.facebook.com/v18.0/${audioMessage.audio.id}`,
        {
          headers: { Authorization: `Bearer ${config.whatsappToken}` },
        }
      );

      if (!audioResponse.ok) {
        throw new Error(`Failed to get audio URL: ${audioResponse.statusText}`);
      }

      const audioData = (await audioResponse.json()) as { url: string };

      // 2. Download the actual audio file
      const mediaResponse = await fetch(audioData.url, {
        headers: { Authorization: `Bearer ${config.whatsappToken}` },
      });

      if (!mediaResponse.ok) {
        throw new Error(`Failed to download audio: ${mediaResponse.statusText}`);
      }

      const audioBuffer = await mediaResponse.arrayBuffer();
      
      // 3. Extract text from audio using Cloudflare Whisper
      const extractedText = await audioToText.convertAudioToText(audioBuffer, 'CLOUDFLARE_WHISPER');
      
      console.log('Extracted text:', extractedText);
      // Use extracted text or fallback message
      return extractedText || "No speech detected: Error 3";
    } catch (error) {
      console.error('Error processing audio:', error);
      // Fallback message if processing fails
      return "No speech detected: Error 4";
    }
}