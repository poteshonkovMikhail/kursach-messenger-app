// Message.cs
using System.Text.Json.Serialization;

namespace Messenger.Models
{
    public class Message
    {
        public Guid MessageId { get; set; }
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }
        [JsonIgnore]
        public string SenderId { get; set; }

        //[JsonIgnore]
        public User Sender { get; set; }

        public Guid ChatId { get; set; }
        [JsonIgnore]
        public Chat Chat { get; set; }

        public Message() { }

        public Message(User sender, string content, Chat chat)
        {
            MessageId = Guid.NewGuid();
            //SenderId = sender.Id;
            Sender = sender;
            Content = content;
            Timestamp = DateTime.UtcNow;
            ChatId = chat.ChatId;
            Chat = chat;
        }
    }
}    
