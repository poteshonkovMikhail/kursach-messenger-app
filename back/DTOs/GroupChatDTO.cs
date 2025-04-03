// GroupChatDTO.cs
namespace Messenger.DTOs
{
    public class GroupChatDTO
    {
        public Guid GroupChatId { get; set; }
        public string Title { get; set; }
        public string AdminId { get; set; }
        public List<string> ParticipantIds { get; set; }
        public Dictionary<string, string> UserRoles { get; set; }
    }
}