// UserDTO.cs
namespace Messenger.DTOs
{
    public class UserDTO
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Username { get; set; }
        public string Status { get; set; }
    }
}