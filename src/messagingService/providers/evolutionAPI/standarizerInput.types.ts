// Evolution API Types based on official documentation

export type EvolutionAPIWebhookPayload = {
  event: "messages.upsert" | "messages.update" | "messages.delete" | "connection.update" | "call";
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message?: EvolutionAPIMessage;
    messageTimestamp?: number;
    status?: "PENDING" | "SENT" | "RECEIVED" | "READ" | "FAILED";
    pushName?: string;
    businessOwnerJid?: string;
  };
};

// Evolution API Message Types
export type EvolutionAPIMessage = 
  | EvolutionAPITextMessage
  | EvolutionAPIAudioMessage
  | EvolutionAPIImageMessage
  | EvolutionAPIVideoMessage
  | EvolutionAPIDocumentMessage
  | EvolutionAPIStickerMessage
  | EvolutionAPIInteractiveMessage;

// Text Message
export type EvolutionAPITextMessage = {
  conversation: string;
  contextInfo?: {
    quotedMessage?: {
      conversation?: string;
    };
    mentionedJid?: string[];
  };
};

// Audio Message
export type EvolutionAPIAudioMessage = {
  audioMessage: {
    url?: string;
    mimetype: string;
    seconds?: number;
    ptt?: boolean;
    fileLength?: number;
    fileSha256?: string;
    fileEncSha256?: string;
    mediaKey?: string;
    contextInfo?: {
      mentionedJid?: string[];
    };
  };
};

// Image Message
export type EvolutionAPIImageMessage = {
  imageMessage: {
    url?: string;
    mimetype: string;
    caption?: string;
    fileLength?: number;
    fileSha256?: string;
    fileEncSha256?: string;
    mediaKey?: string;
    contextInfo?: {
      mentionedJid?: string[];
    };
  };
};

// Video Message
export type EvolutionAPIVideoMessage = {
  videoMessage: {
    url?: string;
    mimetype: string;
    caption?: string;
    seconds?: number;
    fileLength?: number;
    fileSha256?: string;
    fileEncSha256?: string;
    mediaKey?: string;
    contextInfo?: {
      mentionedJid?: string[];
    };
  };
};

// Document Message
export type EvolutionAPIDocumentMessage = {
  documentMessage: {
    url?: string;
    mimetype: string;
    fileName?: string;
    fileLength?: number;
    fileSha256?: string;
    fileEncSha256?: string;
    mediaKey?: string;
    contextInfo?: {
      mentionedJid?: string[];
    };
  };
};

// Sticker Message
export type EvolutionAPIStickerMessage = {
  stickerMessage: {
    url?: string;
    mimetype: string;
    fileLength?: number;
    fileSha256?: string;
    fileEncSha256?: string;
    mediaKey?: string;
    contextInfo?: {
      mentionedJid?: string[];
    };
  };
};

// Interactive Message (List Reply)
export type EvolutionAPIInteractiveMessage = {
  interactiveMessage: {
    type: "listResponseMessage";
    listResponseMessage: {
      title: string;
      description?: string;
      singleSelectReply: {
        selectedRowId: string;
      };
    };
  };
};

// Evolution API Error Type
export type EvolutionAPIError = {
  code: number;
  message: string;
  details?: string;
};

// Evolution API Response Type
export type EvolutionAPIResponse = {
  success: boolean;
  message?: string;
  data?: any;
  error?: EvolutionAPIError;
};
