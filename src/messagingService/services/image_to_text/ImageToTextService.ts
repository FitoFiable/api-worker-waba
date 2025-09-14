import { AwsClient } from 'aws4fetch';
import type { ImageToTextOptions, ConversionMethod, TextractResponse, AWSTextractConfig } from './types.js';

export class ImageToTextService {
  private conversionMethod: ConversionMethod;
  private awsTextractConfig?: AWSTextractConfig;

  constructor(options: ImageToTextOptions) {
    this.conversionMethod = options.method;
    this.awsTextractConfig = options.awsTextractConfig;
  }
 
  /**
   * Convert an image to text using the specified method
   * @param imageBuffer - Uint8Array containing the image data
   * @param method - Optional conversion method override
   * @returns Promise with the extracted text
   */
  async convertImageToText(
    imageBuffer?: ArrayBuffer,
    imageBase64?: string, // base64 encoded image data
    method?: ConversionMethod
  ): Promise<string> {
    const conversionMethod = method || this.conversionMethod;
    
    switch (conversionMethod) {
      case 'AWS_TEXTRACT':
        if (imageBuffer) {
          return this.convertWithTextract(imageBuffer);
        } else if (imageBase64) {
          return this.convertWithTextractBase64(imageBase64);
        } else {
          throw new Error('No image data provided');
        }
      case 'NONE':
        return 'No image to text conversion method specified';
      default:
        return 'No image to text conversion method specified';
    }
  }

  /**
   * Convert image to text using AWS Textract
   * @param imageBuffer - Uint8Array containing the image data
   * @param config - AWS Textract configuration
   * @returns Promise with the extracted text
   */
  private async convertWithTextract(
    imageBuffer: ArrayBuffer, 
  ): Promise<string> {

    if (!this.awsTextractConfig) {
      throw new Error('AWS Textract configuration is required for AWS_TEXTRACT method');
    }
    try {
      // Convert the image buffer to base64 encoding for AWS Textract
      // This is done in chunks to handle large images without stack overflow
      let binary = '';
      const bytes = new Uint8Array(imageBuffer);
      const chunkSize = 0x8000; // 32KB chunks to avoid stack overflow

      // Process the buffer in chunks, converting each to a binary string
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }

      // Convert the binary string to base64 for sending to AWS
      const imageBase64  = btoa(binary);

      
      const region = this.awsTextractConfig?.region || 'us-east-1';
      const endpoint = this.awsTextractConfig?.endpoint || `https://textract.${region}.amazonaws.com`;
      
      const awsClient = new AwsClient({
        accessKeyId: this.awsTextractConfig?.accessKey,
        secretAccessKey: this.awsTextractConfig?.secretKey,
        region: region,
        service: 'textract'
      });

      const request = new Request(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'Textract.DetectDocumentText'
        },
        body: JSON.stringify({
          Document: {
            Bytes: imageBase64
          }
        })
      });

      const response = await awsClient.fetch(request);
      
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Textract request failed: ${errText}`);
      }

      const result = await response.json() as {
        Blocks: {
          BlockType: string;
          Text?: string;
          Geometry?: {
            BoundingBox: { Left: number; Top: number; Width: number; Height: number };
          };
        }[];
      };
      
      // Extract text with coordinates
      const lines = result.Blocks.filter(b => b.BlockType === "LINE");
      const extractedData = lines.map(line => ({
        text: line.Text,
        box: line.Geometry?.BoundingBox,
      }));
      
      return JSON.stringify(extractedData, null, 2);
    } catch (error) {
      throw new Error(`Failed to convert image to text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async convertWithTextractBase64(
    imageBase64: string, // base64 encoded image data
  ): Promise<string> {
    if (!this.awsTextractConfig) {
      throw new Error('AWS Textract configuration is required for AWS_TEXTRACT method');
    }
    const region = this.awsTextractConfig?.region || 'us-east-1';
    const endpoint = this.awsTextractConfig?.endpoint || `https://textract.${region}.amazonaws.com`;

    const awsClient = new AwsClient({
      accessKeyId: this.awsTextractConfig?.accessKey,
      secretAccessKey: this.awsTextractConfig?.secretKey,
      region: region,
      service: 'textract'
    });

    const request = new Request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'Textract.DetectDocumentText'
      },
      body: JSON.stringify({
        Document: {
          Bytes: imageBase64
        }
      })
    });

    const response = await awsClient.fetch(request);
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Textract request failed: ${errText}`);
    }

    const result = await response.json() as {
      Blocks: {
        BlockType: string;
        Text?: string;
        Geometry?: {
          BoundingBox: { Left: number; Top: number; Width: number; Height: number };
        };
      }[];
    };
    
    // Extract text with coordinates
    const lines = result.Blocks.filter(b => b.BlockType === "LINE");
    const extractedData = lines.map(line => ({
      text: line.Text,
      box: line.Geometry?.BoundingBox,
    }));
    
    return JSON.stringify(extractedData, null, 2);
  }


  
}
