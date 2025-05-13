// UserController.cs
using Messenger.DTOs;
using Messenger.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;

namespace Messenger.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("CorsPolicy")]
    public class UsersController : ControllerBase
    {
        private readonly MessengerDbContext _context;
        private readonly UserManager<User> _userManager;

        public UsersController(MessengerDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("{id}/chats")]
        public async Task<ActionResult<IEnumerable<Chat>>> GetUserChats(string id)
        {
            var user = await _context.Users
                .Include(u => u.ChatsAsUser1)
                    .ThenInclude(c => c.User2)
                .Include(u => u.ChatsAsUser2)
                    .ThenInclude(c => c.User1)
                .Include(u => u.ChatsAsUser1)
                    .ThenInclude(c => c.Messages)
                .Include(u => u.ChatsAsUser2)
                    .ThenInclude(c => c.Messages)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound();

            var chats = user.ChatsAsUser1.Concat(user.ChatsAsUser2).ToList();
            return chats;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            return await _context.Users
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    StatusVisibility = u.StatusVisibility,
                    Avatar = u.Avatar
                })
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            return new UserDTO
            {
                Id = user.Id,
                UserName = user.UserName,
                StatusVisibility = user.StatusVisibility,
                Avatar = user.Avatar 
            };
        }

        [HttpGet("username/{username}")]
        public async Task<ActionResult<UserDTO>> GetUserByUsername(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null) return NotFound();

            return new UserDTO
            {
                Id = user.Id,
                UserName = user.UserName,
                StatusVisibility = user.StatusVisibility,
                Avatar = user.Avatar
            };
        }

        [HttpPost]
        public async Task<ActionResult<UserDTO>> CreateUser(UserDTO userDto)
        {
            // Генерируем аватар только если он не был предоставлен
            var avatar = !string.IsNullOrEmpty(userDto.Avatar)
                ? userDto.Avatar
                : GenerateOptimizedDefaultAvatar(userDto.UserName);

            var user = new User(userDto.UserName)
            {
                StatusVisibility = userDto.StatusVisibility,
                Avatar = avatar
            };

            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return CreatedAtAction(nameof(GetUser),
                new { id = user.Id },
                new UserDTO
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    StatusVisibility = user.StatusVisibility,
                    Avatar = user.Avatar
                });
        }

        private string GenerateOptimizedDefaultAvatar(string username)
        {
            // Возвращаем только HEX-код цвета
            var colors = new[] {
        "#3B82F6", // blue-500
        "#EF4444", // red-500
        "#10B981", // green-500
        "#F59E0B", // yellow-500
        "#8B5CF6", // violet-500
        "#EC4899"  // pink-500
    };

            return colors[Math.Abs(username.GetHashCode()) % colors.Length];
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, UserDTO userDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.UserName = userDto.UserName;
            user.StatusVisibility = userDto.StatusVisibility;
            if (!string.IsNullOrEmpty(userDto.Avatar))
            {
                user.Avatar = userDto.Avatar;
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return NoContent();
        }

        [HttpPost("{id}/avatar")]
        public async Task<IActionResult> UploadAvatar(string id, [FromBody] string avatarBase64)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.Avatar = avatarBase64;
            await _context.SaveChangesAsync();

            return Ok(new { Avatar = user.Avatar });
        }
    }
}