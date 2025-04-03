// UserGroupChat.cs
using System.ComponentModel.DataAnnotations;

namespace Messenger.Models
{
    public class UserGroupChat
    {
        [Key]
        public string UserId { get; set; }
        public User User { get; set; }

        [Key]
        public Guid GroupChatId { get; set; }
        public GroupChat GroupChat { get; set; }
    }
}