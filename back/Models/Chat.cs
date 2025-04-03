// Chat.cs
namespace Messenger.Models
{
    public class Chat
    {
        public Guid ChatId { get; private set; }
        public string User1Id { get; private set; }
        public string User2Id { get; private set; }

        public User User1 { get; private set; }
        public User User2 { get; private set; }
        public List<Message> Messages { get; private set; } = new List<Message>();

        // Required for EF Core
        protected Chat() { }

        public Chat(User user1, User user2)
        {
            ChatId = Guid.NewGuid();
            User1Id = user1.Id;
            User2Id = user2.Id;
            User1 = user1;
            User2 = user2;
        }
    }
}