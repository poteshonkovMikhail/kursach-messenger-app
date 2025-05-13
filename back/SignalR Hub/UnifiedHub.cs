// Hubs/UnifiedHub.cs
using Microsoft.AspNetCore.SignalR;
using Messenger.Models;
using Messenger.DTOs;
using Messenger.Services;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;

namespace Messenger.Hubs
{
    public class UnifiedHub : Hub
    {
        private readonly MessengerDbContext _context;
        private readonly MessageService _messageService;
        private readonly GroupMessageService _groupMessageService;

        public UnifiedHub(
            MessengerDbContext context,
            MessageService messageService,
            GroupMessageService groupMessageService)
        {
            _context = context;
            _messageService = messageService;
            _groupMessageService = groupMessageService;
        }

        public async Task Join(string chatId_or_chats_overview, bool isGroupChat, string userId)
        {
            // Добавляем соединение в обе группы
            await Task.WhenAll(
                Groups.AddToGroupAsync(Context.ConnectionId, chatId_or_chats_overview),
                Groups.AddToGroupAsync(Context.ConnectionId, "chats_overview")
            );

            // Отправляем статус онлайн во все связанные группы
            await Task.WhenAll(
                Clients.Group(chatId_or_chats_overview).SendAsync("ReceiveOnlineStatus", new OnlineStatusDto
                {
                    IsOnline = true,
                    UserId = userId
                }),
                Clients.Group("chats_overview").SendAsync("ReceiveOnlineStatus", new OnlineStatusDto
                {
                    IsOnline = true,
                    UserId = userId
                })
            );
        }

        private static readonly ConcurrentDictionary<string, DateTime> _lastPingTimes = new();
        private static readonly ConcurrentDictionary<string, DateTime> _userActivity = new();

        public async Task UpdateUserActivity(string userId)
        {
            _userActivity[userId] = DateTime.UtcNow;
            await Clients.Group("chats_overview").SendAsync("ReceiveOnlineStatus", new OnlineStatusDto
            {
                IsOnline = true,
                UserId = userId,
                LastActive = _userActivity.TryGetValue(userId, out var lastActive) ? lastActive : DateTime.UtcNow
            });
        }

        public async Task PingOnlineStatus(string userId)
        {
            _lastPingTimes[userId] = DateTime.UtcNow;
            await Clients.Group("chats_overview").SendAsync("ReceiveOnlineStatus", new OnlineStatusDto
            {
                IsOnline = true,
                UserId = userId
            });
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "chats_overview");
                await Clients.Group("chats_overview").SendAsync("ReceiveOnlineStatus", new OnlineStatusDto
                {
                    IsOnline = true,
                    UserId = userId
                });
            }
            await base.OnConnectedAsync();
        }



        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await Clients.Group("chats_overview").SendAsync("ReceiveOnlineStatus", new OnlineStatusDto
                {
                    IsOnline = false,
                    UserId = userId
                });
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task Leave(string groupId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupId);
        }

        // Методы для личных чатов
        public async Task<MessageDTO> SendPersonalMessage(string chatId, string content, string userId)
        {
            var messageDto = await _messageService.SendMessage(chatId, content, userId);
            await Clients.Group(chatId).SendAsync("ReceiveMessage", messageDto);
            return messageDto;
        }

        // Методы для групповых чатов
        public async Task<MessageDTO> SendGroupMessage(string groupId, string content, string userId)
        {
            var messageDto = await _groupMessageService.SendMessage(groupId, content, userId);
            await Clients.Group(groupId).SendAsync("ReceiveGroupMessage", messageDto);
            return messageDto;
        }

        // Общие уведомления
        public async Task NotifyTyping(string chatId, string userId, bool isTyping, bool isGroupChat)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            // Отправляем уведомление всем участникам чата
            await Clients.Group(chatId).SendAsync("ReceiveTypingStatus", new TypingStatusDTO
            {
                UserId = userId,
                UserName = user.UserName,
                IsTyping = isTyping,
                ChatId = chatId,
                IsGroupChat = isGroupChat
            });

            // Дополнительная отправка в глобальную группу для ChatsPage
            await Clients.Group("chats_overview").SendAsync("ReceiveTypingStatus", new TypingStatusDTO
            {
                UserId = userId,
                UserName = user.UserName,
                IsTyping = isTyping,
                ChatId = chatId,
                IsGroupChat = isGroupChat
            });
        }

        // Метод для редактирования сообщений
        public async Task<MessageDTO> EditMessage(string messageId, string newContent, string userId, bool isGroupChat)
        {
            MessageDTO editedMessage;
            string chatId;

            if (isGroupChat)
            {
                editedMessage = await _groupMessageService.EditMessage(messageId, newContent, userId);
                chatId = editedMessage.ChatOrGroupChatId;
                await Clients.Group(chatId).SendAsync("ReceiveGroupEditedMessage", editedMessage);
            }
            else
            {
                editedMessage = await _messageService.EditMessage(messageId, newContent, userId);
                chatId = editedMessage.ChatOrGroupChatId;
                await Clients.Group(chatId).SendAsync("ReceiveEditedMessage", editedMessage);
            }

            
            return editedMessage;
        }

        // Метод для удаления сообщений
        public async Task DeleteMessage(string messageId, string userId, bool isGroupChat)
        {
            try
            {
                string chatId;
                if (isGroupChat)
                {
                    chatId = await _groupMessageService.DeleteMessage(messageId, userId);
                    await Clients.Group(chatId).SendAsync("ReceiveGroupDeletedMessage", messageId);
                }
                else
                {
                    chatId = await _messageService.DeleteMessage(messageId, userId);
                    await Clients.Group(chatId).SendAsync("ReceiveDeletedMessage", messageId);
                }

            }
            catch (HubException ex)
            {
                // Отправляем детализированную ошибку клиенту
                await Clients.Caller.SendAsync("OperationError", new
                {
                    Code = "DELETE_FAILED",
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                // Логируем полную ошибку
                throw new Exception($"{ex}");
                await Clients.Caller.SendAsync("OperationError", new
                {
                    Code = "SERVER_ERROR",
                    Message = "Internal server error"
                });
            }
        }

        public class TypingStatusDTO
        {
            public string UserId { get; set; }
            public string UserName { get; set; }
            public bool IsTyping { get; set; }
            public string ChatId { get; set; }
            public bool IsGroupChat { get; set; }
        }

        public class OnlineStatusDto
        {
            public bool IsOnline { get; set; }
            public string UserId { get; set; }
            public DateTime LastActive { get; set; }
        }
    }
}