// Services/MessageService.cs
using Messenger.DTOs;
using Messenger.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Messenger.Services
{
    public class MessageService : IMessageService
    {
        protected readonly MessengerDbContext _context;

        public MessageService(MessengerDbContext context)
        {
            _context = context;
        }

        public virtual async Task<MessageDTO> SendMessage(string chatId, string content, string userId)
        {
            var sender = await _context.Users.FindAsync(userId);
            if (sender == null)
            {
                throw new HubException("User not found");
            }

            var chat = await _context.Chats.FindAsync(chatId);
            if (chat == null)
            {
                throw new HubException("Chat not found");
            }

            var message = new Message(sender, content, chat)
            {
                Timestamp = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return CreateMessageDto(message, chatId, sender, content);
        }

        protected MessageDTO CreateMessageDto(Message message, string chatId, User sender, string content)
        {
            return new MessageDTO
            {
                MessageId = message.MessageId,
                Sender = sender,
                ChatOrGroupChatId = chatId,
                Content = content,
                Timestamp = message.Timestamp,
                //ChatType = ChatType.Private
            };
        }

        protected MessageDTO CreateMessageDto(Message message)
        {
            return new MessageDTO
            {
                MessageId = message.MessageId,
                Sender = message.Sender,
                ChatOrGroupChatId = message.ChatOrGroupChatId,
                Content = message.Content,
                Timestamp = message.Timestamp,
                //ChatType = ChatType.Private
            };
        }

        public virtual async Task<MessageDTO> EditMessage(string messageId, string newContent, string editorUserId)
        {
            var message = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Chat)
                .FirstOrDefaultAsync(m => m.MessageId == messageId);

            if (message == null) {
                throw new HubException("Message Not Found :(");
            }

            if (message.SenderId != editorUserId)
            {
                throw new HubException("You can only edit your own messages");
            }

            message.Content = newContent;
            //message.Timestamp = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return CreateMessageDto(message);
        }

        public virtual async Task<string> DeleteMessage(string messageId, string userId)
        {
            if (string.IsNullOrEmpty(messageId) || string.IsNullOrEmpty(userId))
                throw new HubException("Invalid request parameters");

            var message = await _context.Messages
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MessageId == messageId);

            if (message == null)
                throw new HubException("Message not found or already deleted");

            if (message.SenderId != userId)
                throw new HubException("Access denied: You can only delete your own messages");

            try
            {
                _context.Messages.Remove(message);
                await _context.SaveChangesAsync();
                return message.ChatOrGroupChatId;
            }
            catch (DbUpdateException ex)
            {
                throw new HubException($"Database error: {ex.InnerException?.Message ?? ex.Message}");
            }
        }

        public virtual async Task<IEnumerable<MessageDTO>> GetRecentMessagesAsync(string chatId)
        {
            return await _context.Messages
                .Where(m => m.ChatOrGroupChatId == chatId)
                .OrderByDescending(m => m.Timestamp)
                .Take(50) // или другое разумное ограничение
                .Select(m => CreateMessageDto(m))
                .ToListAsync();
        }
    }
}