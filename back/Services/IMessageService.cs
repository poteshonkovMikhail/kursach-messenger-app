// Services/IMessageService.cs
using Messenger.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Messenger.Services
{
    public interface IMessageService
    {
        Task<MessageDTO> SendMessage(string chatId, string content, string userId);
        Task<IEnumerable<MessageDTO>> GetRecentMessagesAsync(string chatId);
        Task<MessageDTO> EditMessage(string messageId, string newContent, string editorUserId);
        Task<string> DeleteMessage(string messageId, string userId); // Новый метод
    }
}