export interface User {
  id: string;  // Изменяем с userId на id для соответствия бэкенду
  username?: string;
  status?: string;
}

export interface Message {
  messageId?: string;
  chatId?: string;
  sender?: User;
  content?: string;
  timestamp?: string;
}

export interface Chat {
  chatId?: string;
  user1?: User;
  user2?: User;
  messages?: Message[];
}

export interface GroupChat extends Chat {
  groupChatId?: string; // UUID
  title?: string;
  admin?: User;
  participants?: User[];
  userRoles?: Record<string, string>;
}
