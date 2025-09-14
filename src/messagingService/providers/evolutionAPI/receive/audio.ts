import { EvolutionAPIAudioMessage } from "../standarizerInput.types.js";
import { AudioToTextService } from "@/messagingService/services/audio_to_text/index.js";
import { ProviderConfig } from "@/messagingService/index.types.js";
import { isEvolutionAPIConfig } from "../validation.js";

export async function audioInputToText(audio: EvolutionAPIAudioMessage, config: ProviderConfig): Promise<string> {
    // Validate that config is for Evolution API
    if (!isEvolutionAPIConfig(config)) {
      console.warn('Invalid configuration: expected Evolution API provider, skipping audio text extraction');
      return "No speech detected: Error 1";
    }

    const audioMessage = audio as EvolutionAPIAudioMessage;
      
    // Check if we have the required configuration for audio processing
    if (!config?.cloudflareCredentials) {
      console.warn('Cloudflare credentials not provided, skipping audio text extraction');
      return "No speech detected: Error 1";
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
      // Check if we have a URL to process
      if (!audioMessage.audioMessage.url) {
        console.warn('No audio URL available for processing');
        return "No speech detected: Error 2";
      }

      // Download the audio directly from the URL
      const mediaResponse = await fetch(audioMessage.audioMessage.url);

      if (!mediaResponse.ok) {
        throw new Error(`Failed to download audio: ${mediaResponse.statusText}`);
      }

      const audioBuffer = await mediaResponse.arrayBuffer();
      
      // Extract text from audio using Cloudflare Whisper
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
