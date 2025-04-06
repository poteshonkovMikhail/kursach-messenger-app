// UserDTO.cs
using System.ComponentModel.DataAnnotations;

namespace Messenger.DTOs
{
    public class UserDTO
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Avatar { get; set; } = null;

        [Required]
        public string Username { get; set; }

        public string Status { get; set; }

    }
}