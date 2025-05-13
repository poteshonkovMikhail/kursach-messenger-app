import * as signalR from '@microsoft/signalr';
import { TypingStatusDto, Message, OnlineStatusDto } from '../types';
import { getToken } from '../utils/auth';

const UNIFIED_HUB_URL = 'https://localhost:7058/unifiedHub';
let unifiedConnection: signalR.HubConnection | null = null;


// Инициализация соединения
export const startUnifiedConnection = async (): Promise<signalR.HubConnection | null> => {
  if (unifiedConnection?.state === signalR.HubConnectionState.Connected) {
    return unifiedConnection;
  }

  const token = getToken();
  if (!token) {
    console.warn('No token available - skipping SignalR connection');
    return null;
  }

  unifiedConnection = new signalR.HubConnectionBuilder()
    .withUrl(UNIFIED_HUB_URL, {
      accessTokenFactory: () => token,
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  try {
    await unifiedConnection.start();
    console.log('Connected to UnifiedHub');
    return unifiedConnection;
  } catch (error) {
    console.error('UnifiedHub Connection Error:', error);
    return null;
  }
};

export const joinGlobalChatsGroup = async (userId: string | undefined) => {
  await unifiedConnection?.invoke('Join', 'chats_overview', true, userId);
};


// Основные методы
export const joinChat = async (chatId: string, isGroupChat: boolean, userId: string | undefined): Promise<void> => {
  await unifiedConnection?.invoke('Join', chatId, isGroupChat, userId);
};

export const leaveChat = async (chatId: string): Promise<void> => {
  await unifiedConnection?.invoke('Leave', chatId);
};

// Отправка сообщений
export const sendMessage = async (
  chatId: string, 
  content: string, 
  userId: string, 
  isGroupChat: boolean
): Promise<void> => {
  const method = isGroupChat ? 'SendGroupMessage' : 'SendPersonalMessage';
  await unifiedConnection?.invoke(method, chatId, content, userId);
};

export const editMessage = async (
  messageId: string, 
  newContent: string, 
  userId: string, 
  isGroupChat: boolean
): Promise<void> => {
  const method = isGroupChat ? 'EditGroupMessage' : 'EditMessage';
  await unifiedConnection?.invoke(method, messageId, newContent, userId, isGroupChat);
};

export const deleteMessage = async (
  messageId: string, 
  userId: string, 
  isGroupChat: boolean
): Promise<void> => {
  const method = isGroupChat ? 'DeleteGroupMessage' : 'DeleteMessage';
  await unifiedConnection?.invoke(method, messageId, userId, isGroupChat);
};

// Подписка на события
export const onReceiveMessage = (
  callback: (message: Message) => void,
  isGroupChat: boolean
): void => {
  const eventName = isGroupChat ? 'ReceiveGroupMessage' : 'ReceiveMessage';
  unifiedConnection?.on(eventName, callback);
};

export const onReceiveEditedMessage = (
  callback: (message: Message) => void,
  isGroupChat: boolean
): void => {
  const eventName = isGroupChat ? 'ReceiveEditedGroupMessage' : 'ReceiveEditedMessage';
  unifiedConnection?.on(eventName, callback);
};

export const onReceiveDeletedMessage = (
  callback: (messageId: string) => void,
  isGroupChat: boolean
): void => {
  const eventName = isGroupChat ? 'ReceiveDeletedGroupMessage' : 'ReceiveDeletedMessage';
  unifiedConnection?.on(eventName, callback);
};

export const onReceiveOnlineStatus = (
  callback: (onlineStatus: OnlineStatusDto) => void,
): void => {
  const eventName = 'ReceiveOnlineStatus'
  unifiedConnection?.on(eventName, callback);
};

// Уведомления о печати
export const notifyTyping = async (
  chatId: string, 
  userId: string, 
  isTyping: boolean, 
  isGroupChat: boolean
): Promise<void> => {
  await unifiedConnection?.invoke('NotifyTyping', chatId, userId, isTyping, isGroupChat);
};

export const onReceiveTypingStatus = (
  callback: (status: TypingStatusDto) => void
): void => {
  unifiedConnection?.on('ReceiveTypingStatus', callback);
};

// Отписка от событий
export const removeMessageListener = (
  callback: (message: Message | string) => void,
  isGroupChat: boolean
): void => {
  const eventName = isGroupChat ? 'ReceiveGroupMessage' : 'ReceiveMessage';
  unifiedConnection?.off(eventName, callback);
};

export const removeTypingStatusListener = (
  callback: (status: TypingStatusDto) => void
): void => {
  unifiedConnection?.off('ReceiveTypingStatus', callback);
};

export const removeOnlineStatusListener = (
  callback: (onlineStatus: OnlineStatusDto) => void,
): void => {
  unifiedConnection?.off('ReceiveOnlineStatus', callback);
};

export const pingOnlineStatus = async (userId: string) => {
  await unifiedConnection?.invoke("PingOnlineStatus", userId);
};

export const updateUserActivity = async (userId: string) => {
  await unifiedConnection?.invoke("UpdateUserActivity", userId);
};

