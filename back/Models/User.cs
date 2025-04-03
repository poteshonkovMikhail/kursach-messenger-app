// User.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Text.Json.Serialization;

namespace Messenger.Models
{
    public class User : IdentityUser
    {
        public string Status { get; set; } = "public"; // Статус пользователя

        [JsonIgnore]
        [ValidateNever]
        public List<UserGroupChat> UserGroupChats { get; set; }

        [JsonIgnore]
        public List<Message> SentMessages { get; set; } = new List<Message>();

        [JsonIgnore]
        public List<Message> ReceivedMessages { get; set; } = new List<Message>();

        // Добавляем связь с чатами, где пользователь является User1
        [JsonIgnore]
        public List<Chat> ChatsAsUser1 { get; set; } = new List<Chat>();

        // Добавляем связь с чатами, где пользователь является User2
        [JsonIgnore]
        public List<Chat> ChatsAsUser2 { get; set; } = new List<Chat>();

        public User() : base() { }

        public User(string username) : base(username) { }

        public void UpdateStatus(string newStatus)
        {
            Status = newStatus;
        }

        // Метод для получения всех чатов пользователя
        public IEnumerable<Chat> GetAllChats()
        {
            return ChatsAsUser1.Concat(ChatsAsUser2);
        }
    }
}