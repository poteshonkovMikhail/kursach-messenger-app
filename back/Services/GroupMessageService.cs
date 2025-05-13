// Services/GroupMessageService.cs
using Messenger.DTOs;
using Messenger.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Messenger.Services
{
    public class GroupMessageService : MessageService
    {
        public GroupMessageService(MessengerDbContext context) : base(context)
        {
        }

        public override async Task<MessageDTO> SendMessage(string groupChatId, string content, string userId)
        {
            var sender = await _context.Users.FindAsync(userId);
            if (sender == null) throw new HubException("User not found");

            var groupChat = await _context.GroupChats
                .Include(g => g.Participants)
                .FirstOrDefaultAsync(g => g.Id == groupChatId);

            if (groupChat == null) throw new HubException("Group chat not found");

            // Check if user is participant
            if (!groupChat.Participants.Any(p => p.Id == userId))
                throw new HubException("You are not a member of this group");

            var message = new Message(sender, content, groupChat)
            {
                Timestamp = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return CreateMessageDto(message);
        }

        public override async Task<MessageDTO> EditMessage(string messageId, string newContent, string editorUserId)
        {
            var message = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.GroupChat)
                .FirstOrDefaultAsync(m => m.MessageId == messageId);

            if (message == null) throw new HubException("Message not found");
            if (message.SenderId != editorUserId) throw new HubException("You can only edit your own messages");

            message.Content = newContent;
            await _context.SaveChangesAsync();

            return CreateMessageDto(message);
        }

        public override async Task<string> DeleteMessage(string messageId, string userId)
        {
            var message = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.GroupChat)
                .FirstOrDefaultAsync(m => m.MessageId == messageId);

            if (message == null)
                throw new HubException("Message not found");
            if (message.SenderId != userId)
                throw new HubException("You can only delete your own messages");

            string groupId = message.ChatOrGroupChatId;
            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();

            return groupId;
        }
    }
}