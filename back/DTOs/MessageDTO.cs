// MessageDTO.cs
namespace Messenger.DTOs
{
    public class MessageDTO
    {
        public Guid MessageId { get; set; }
        public string SenderId { get; set; }
        public Guid ChatId { get; set; }
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }
    }
}