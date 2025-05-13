// src/utils/formatters.ts
export const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };
  
  export const formatLastMessage = (message?: { content: string, timestamp?: string }): string => {
    if (!message) return 'No messages yet';
    
    const content = message.content.length > 30 
      ? `${message.content.substring(0, 30)}...` 
      : message.content;
    
    const time = formatTimestamp(message.timestamp);
    
    return `${content} • ${time}`;
  };