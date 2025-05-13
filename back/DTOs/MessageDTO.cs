using Messenger.Models;

// MessageDTO.cs
namespace Messenger.DTOs
{       
    public class MessageDTO
    {
        public string MessageId { get; set; }
        public User Sender { get; set; }
        //public ChatType ChatType { get; set; }
        public string ChatOrGroupChatId { get; set; }
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }
    }

    
}