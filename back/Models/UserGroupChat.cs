// UserGroupChat.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Messenger.Models
{
    public class UserGroupChat
    {
        [ForeignKey("User")]
        public string UserId { get; set; }

        [ForeignKey("GroupChat")]
        public string GroupChatId { get; set; }

        public User User { get; set; }
        public GroupChat GroupChat { get; set; }
    }
}