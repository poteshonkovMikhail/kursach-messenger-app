// UserDTO.cs
using System.ComponentModel.DataAnnotations;

namespace Messenger.DTOs
{
    public class UserDTO
    {
        public string Id { get; set; }
        public string Avatar { get; set; }
        public string Email { get; set; }

        [Required]
        public string UserName { get; set; }

        public string StatusVisibility { get; set; }
    }
}