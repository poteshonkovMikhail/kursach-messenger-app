// LoginViewModel.cs
using System.ComponentModel.DataAnnotations;

namespace Messenger.Models
{
    public class LoginViewModel
    {
        [Required(ErrorMessage = "Username or email is required")]
        public string UsernameOrEmail { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        public bool RememberMe { get; set; }
    }
}