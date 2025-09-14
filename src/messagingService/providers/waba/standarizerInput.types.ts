// WhatsApp Business API (WABA) Types based on official documentation

export type WhatsAppWebhookPayload = {
  object: "whatsapp_business_account";
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: "whatsapp";
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages: Array<WhatsAppMessage>;
        errors?: Array<WhatsAppError>;
        statuses?: Array<WhatsAppStatus>;
      };
      field: "messages" | "statuses";
    }>;
  }>;
};

// WhatsApp Message Types
export type WhatsAppMessage = 
  | WhatsAppTextMessage
  | WhatsAppAudioMessage
  | WhatsAppImageMessage
  | WhatsAppInteractiveMessage;

// Text Message
export type WhatsAppTextMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: "text";
  text: {
    body: string;
  };
  context?: {
    from: string;
    id: string;
    forwarded?: boolean;
    frequently_forwarded?: boolean;
  };
};

// Audio Message
export type WhatsAppAudioMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: "audio";
  audio: {
    id: string;
    mime_type: string;
    sha256?: string;
    voice?: boolean;
  };
  context?: {
    from: string;
    id: string;
    forwarded?: boolean;
    frequently_forwarded?: boolean;
  };
};

// Image Message
export type WhatsAppImageMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: "image";
  image: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  context?: {
    from: string;
    id: string;
    forwarded?: boolean;
    frequently_forwarded?: boolean;
  };
};

// Interactive Message (List Reply)
export type WhatsAppInteractiveMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: "interactive";
  interactive: {
    type: "list_reply";
    list_reply: {
      id: string;
      title: string;
      description?: string;
    };
  };
  context?: {
    from: string;
    id: string;
    forwarded?: boolean;
    frequently_forwarded?: boolean;
  };
};

// WhatsApp Error Type
export type WhatsAppError = {
  code: number;
  title: string;
  message: string;
  error_data?: {
    details: string;
  };
};

// WhatsApp Status Type
export type WhatsAppStatus = {
  id: string;
  status: "sent" | "delivered" | "read";
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    origin: {
      type: string;
    };
  };
  pricing?: {
    category: string;
    pricing_model: string;
  };
};
