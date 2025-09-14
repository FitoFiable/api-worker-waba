import type { AudioToTextOptions, ConversionMethod, WhisperResponse, CloudflareWhisperConfig } from './types.js';

export class AudioToTextService {
  private conversionMethod: ConversionMethod;
  private cloudflareWhisperConfig?: CloudflareWhisperConfig;

  constructor(options: AudioToTextOptions) {
    this.conversionMethod = options.method;
    this.cloudflareWhisperConfig = options.cloudflareWhisperConfig;
  }
 
  /**
   * Convert an audio to text using the specified method
   * @param audioBuffer - ArrayBuffer containing the audio data
   * @param method - Optional conversion method override
   * @returns Promise with the extracted text
   */
  async convertAudioToText(
    audioBuffer: ArrayBuffer,
    method?: ConversionMethod
  ): Promise<string> {
    const conversionMethod = method || this.conversionMethod;
    
    switch (conversionMethod) {
      case 'CLOUDFLARE_WHISPER':
        return this.convertWithWhisper(audioBuffer);
      case 'NONE':
        return 'No audio to text conversion method specified';
      default:
        return 'No audio to text conversion method specified';
    }
  }

  /**
   * Convert audio to text using Cloudflare Whisper
   * @param audioBuffer - ArrayBuffer containing the audio data
   * @returns Promise with the extracted text
   */
  private async convertWithWhisper(
    audioBuffer: ArrayBuffer, 
  ): Promise<string> {

    if (!this.cloudflareWhisperConfig) {
      throw new Error('Cloudflare Whisper configuration is required for CLOUDFLARE_WHISPER method');
    }

    try {
      const { accountId, apiToken, endpoint } = this.cloudflareWhisperConfig;
      
      // Use custom endpoint or default Cloudflare AI endpoint
      const whisperEndpoint = endpoint || `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/openai/whisper`;

      // Convert audio buffer to array of integers (0-255) as required by Cloudflare Whisper
      const audioArray = Array.from(new Uint8Array(audioBuffer));

      const request = new Request(whisperEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio: audioArray
        })
      });

      const response = await fetch(request);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudflare Whisper API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json() as WhisperResponse;
      
      // Extract transcription from the response
      if (result.success && result.result && result.result.text) {
        return result.result.text;
      } else {
        return 'No speech detected in the audio';
      }
    } catch (error) {
      throw new Error(`Failed to convert audio to text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
