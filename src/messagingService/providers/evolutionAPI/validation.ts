import { ProviderConfig, ProviderEvolutionAPIConfig } from '@/messagingService/index.types.js';
import { StandardizedSendResponse } from '@/messagingService/standarized/send/sendCommon.types.js';

// Type guard to check if config is for Evolution API
export const isEvolutionAPIConfig = (config: ProviderConfig): config is ProviderEvolutionAPIConfig => {
  return config.selectedProvider === 'evolutionAPI';
};

// Validate Evolution API configuration
export const validateEvolutionAPIConfig = (config: ProviderConfig): StandardizedSendResponse | null => {
  // Validate that config is for Evolution API
  if (!isEvolutionAPIConfig(config)) {
    return {
      success: false,
      error: {
        message: 'Invalid configuration: expected Evolution API provider',
        code: 'INVALID_CONFIG'
      }
    };
  }

  // Validate required configuration
  if (!config.evolutionAPIKey) {
    return {
      success: false,
      error: {
        message: 'Evolution API key is required for sending messages',
        code: 'MISSING_API_KEY'
      }
    };
  }

  if (!config.evolutionAPIUrl) {
    return {
      success: false,
      error: {
        message: 'Evolution API URL is required for sending messages',
        code: 'MISSING_API_URL'
      }
    };
  }

  if (!config.evolutionInstanceId) {
    return {
      success: false,
      error: {
        message: 'Evolution API instance ID is required for sending messages',
        code: 'MISSING_INSTANCE_ID'
      }
    };
  }

  return null; // No validation errors
};

// Validate basic input requirements
export const validateBasicInput = (to: string | undefined, message?: string): StandardizedSendResponse | null => {
  if (!to) {
    return {
      success: false,
      error: {
        message: 'Recipient is required',
        code: 'INVALID_INPUT'
      }
    };
  }

  if (message !== undefined && !message) {
    return {
      success: false,
      error: {
        message: 'Message content is required',
        code: 'INVALID_INPUT'
      }
    };
  }

  return null; // No validation errors
};

// Validate media input requirements
export const validateMediaInput = (to: string | undefined, mediaUrl?: string, mediaId?: string): StandardizedSendResponse | null => {
  const basicValidation = validateBasicInput(to);
  if (basicValidation) return basicValidation;

  if (!mediaUrl && !mediaId) {
    return {
      success: false,
      error: {
        message: 'Either media URL or media ID is required',
        code: 'INVALID_INPUT'
      }
    };
  }

  return null; // No validation errors
};

// Validate sticker input requirements
export const validateStickerInput = (to: string | undefined, stickerUrl?: string, stickerId?: string): StandardizedSendResponse | null => {
  const basicValidation = validateBasicInput(to);
  if (basicValidation) return basicValidation;

  if (!stickerUrl && !stickerId) {
    return {
      success: false,
      error: {
        message: 'Either sticker URL or sticker ID is required',
        code: 'INVALID_INPUT'
      }
    };
  }

  return null; // No validation errors
};

// Validate reaction input requirements
export const validateReactionInput = (to: string | undefined, emoji: string | undefined, messageId: string | undefined): StandardizedSendResponse | null => {
  const basicValidation = validateBasicInput(to);
  if (basicValidation) return basicValidation;

  if (!emoji) {
    return {
      success: false,
      error: {
        message: 'Emoji is required for reactions',
        code: 'INVALID_INPUT'
      }
    };
  }

  if (!messageId) {
    return {
      success: false,
      error: {
        message: 'Message ID is required for reactions',
        code: 'INVALID_INPUT'
      }
    };
  }

  return null; // No validation errors
};

// Validate list single select input requirements
export const validateListInput = (
  to: string | undefined,
  headerText: string | undefined,
  bodyText: string | undefined,
  buttonText: string | undefined,
  sections: any[] | undefined
): StandardizedSendResponse | null => {
  const basicValidation = validateBasicInput(to);
  if (basicValidation) return basicValidation;

  if (!headerText || !bodyText || !buttonText) {
    return {
      success: false,
      error: {
        message: 'Header text, body text, and button text are required',
        code: 'INVALID_INPUT'
      }
    };
  }

  if (!sections || sections.length === 0) {
    return {
      success: false,
      error: {
        message: 'At least one section is required',
        code: 'INVALID_INPUT'
      }
    };
  }

  // Validate sections and items
  for (const section of sections) {
    if (!section.title || !section.items || section.items.length === 0) {
      return {
        success: false,
        error: {
          message: 'Each section must have a title and at least one item',
          code: 'INVALID_SECTION'
        }
      };
    }

    for (const item of section.items) {
      if (!item.id || !item.title) {
        return {
          success: false,
          error: {
            message: 'Each list item must have an id and title',
            code: 'INVALID_ITEM'
          }
        };
      }
    }
  }

  return null; // No validation errors
};
