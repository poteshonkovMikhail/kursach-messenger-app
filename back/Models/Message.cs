// Message.cs
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Messenger.Models
{
    // Update the Message class to properly handle foreign keys
    public class Message
    {
        public string MessageId { get; set; }
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }

        [JsonIgnore]
        public string SenderId { get; set; }
        public User Sender { get; set; }

        // Separate foreign keys for Chat and GroupChat
        public string? ChatId { get; set; }
        public string? GroupChatId { get; set; }

        [JsonIgnore]
        public Chat Chat { get; set; }
        [JsonIgnore]
        public GroupChat GroupChat { get; set; }

        // Combined property for DTOs
        [NotMapped]
        public string ChatOrGroupChatId => ChatId ?? GroupChatId ?? "";

        public Message() { }

        public Message(User sender, string content, Chat chat)
        {
            MessageId = Guid.NewGuid().ToString();
            Sender = sender;
            SenderId = sender.Id;
            Content = content;
            Timestamp = DateTime.UtcNow;
            ChatId = chat.Id;
            Chat = chat;
        }

        public Message(User sender, string content, GroupChat groupChat)
        {
            MessageId = Guid.NewGuid().ToString();
            Sender = sender;
            SenderId = sender.Id;
            Content = content;
            Timestamp = DateTime.UtcNow;
            GroupChatId = groupChat.Id?.ToString();
            GroupChat = groupChat;
        }
    }
}    
