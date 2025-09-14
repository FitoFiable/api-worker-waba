import { ProviderConfig } from "@/messagingService/index.types.js";
type GetBase64Response = {
  mediaType: string;
  fileName: string;
  size: {
    fileLength: string;
  };
  mimetype: string;
  base64: string;
}

export const getBase64 = async (config: ProviderConfig, messageId: string, convertToMp4: boolean = false): Promise<GetBase64Response> => {
    // Type guard to ensure we have Evolution API config
    if (config.selectedProvider !== "evolutionAPI") {
        throw new Error("Invalid provider configuration for Evolution API");
    }

    const { evolutionAPIUrl, evolutionAPIKey, evolutionInstanceId } = config;
    
    const url = `${evolutionAPIUrl}/chat/getBase64FromMediaMessage/${evolutionInstanceId}`;
    
    const requestBody = {
        message: {
            key: {
                id: messageId
            }
        },
        convertToMp4
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionAPIKey
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`Failed to get base64 from Evolution API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Return the base64 string from the response
    // The exact response structure may vary, adjust based on actual API response
    return data as GetBase64Response;
}