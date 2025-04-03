// UserController.cs
using Messenger.DTOs;
using Messenger.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;

[Route("api/[controller]")]
[ApiController]
[EnableCors("AllowAll")]
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
                Username = u.UserName,
                Status = u.Status
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
            Username = user.UserName,
            Status = user.Status
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
            Username = user.UserName,
            Status = user.Status
        };
    }

    [HttpPost]
    public async Task<ActionResult<UserDTO>> CreateUser(UserDTO userDto)
    {
        var user = new User(userDto.Username)
        {
            Status = userDto.Status
        };

        var result = await _userManager.CreateAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return CreatedAtAction(nameof(GetUser),
            new { id = user.Id },
            new UserDTO
            {
                Id = user.Id,
                Username = user.UserName,
                Status = user.Status
            });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, UserDTO userDto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        user.UserName = userDto.Username;
        user.Status = userDto.Status;

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
}