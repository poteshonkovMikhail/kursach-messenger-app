
// types.ts
export interface User {
  id: string;
  userName: string;
  email?: string;
  statusVisibility: string;
  avatar: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (token: string, user: User, rememberMe: boolean) => void;
  logout: () => Promise<void>;
  loading: boolean;
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
  messageId: string;
  chatOrGroupChatId?: string;
  sender?: User;
  content: string;
  timestamp?: string;
}

export interface Chat {
  id: string;
  user1?: User;
  user2?: User;
  messages?: Message[];
}

export interface CreateChatRequest {
  user1Id: string;
  user2Id: string;
}

// types.ts
export interface GroupChat {
  id: string;
  title: string;
  admin: User;
  participants: Participant[];
  userRoles: Record<string, 'Admin' | 'Promoter' | 'Member'>; 
  messages: Message[];
}

export interface Participant {
  id: string;
  username: string;
  avatar: string;
  role: 'Admin' | 'Promoter' | 'Member';
  statusVisibility?: string;
}

export interface UserDTO {
  id: string;
  username: string;
  email?: string;
  statusVisibility: string;
  avatar: string;
}

export interface TypingStatusDto {
  userId: string;
  userName: string;
  isTyping: boolean;
  chatId: string;
}

export interface OnlineStatusDto {
  isOnline: boolean,
  userId: string;
  lastActive: string;
}