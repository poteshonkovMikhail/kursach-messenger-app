// types.ts
export interface User {
  id: string;
  username: string;
  email?: string;
  status: string;
  avatar: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  usernameOrEmail: string;
  password: string;
  rememberMe: boolean;
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

export interface CreateChatRequest {
  user1Id: string;
  user2Id: string;
}

export interface GroupChat extends Chat {
  groupChatId?: string; // UUID
  title?: string;
  admin?: User;
  participants?: User[];
  userRoles?: Record<string, string>;
}
