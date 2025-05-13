// AccountController.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Messenger.Models;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Cors;
using Messenger.DTOs;

namespace Messenger.Controllers { 
[Route("api/[controller]")]
[ApiController]
[EnableCors("CorsPolicy")]
public class AccountController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly MessengerDbContext _context;

    public AccountController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IConfiguration configuration,
        MessengerDbContext context)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _context = context;
    }

    [HttpGet("check-username")]
    public async Task<IActionResult> CheckUsernameAvailability([FromQuery] string username)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return BadRequest("Username cannot be empty");
        }

        var user = await _userManager.FindByNameAsync(username);
        return Ok(new { Available = user == null });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Check if username is already taken
        var existingUser = await _userManager.FindByNameAsync(model.Username);
        if (existingUser != null)
        {
            return BadRequest(new { Username = "Username is already taken" });
        }

        // Check if email is already registered
        existingUser = await _userManager.FindByEmailAsync(model.Email);
        if (existingUser != null)
        {
            return BadRequest(new { Email = "Email is already registered" });
        }

        var user = new User(model.Username)
        {
            Email = model.Email,
            UserName = model.Username,
            Avatar = GenerateOptimizedDefaultAvatar(model.Username)
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            // Generate JWT token
            var token = GenerateJwtToken(user);

            return Ok(new
            {
                Token = token,
                User = new UserDTO
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    StatusVisibility = user.StatusVisibility,
                    Avatar = user.Avatar
                }
            });
        }

        return BadRequest(result.Errors);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Check if user exists by username or email
        var user = model.UsernameOrEmail.Contains('@')
            ? await _userManager.FindByEmailAsync(model.UsernameOrEmail)
            : await _userManager.FindByNameAsync(model.UsernameOrEmail);

        if (user == null)
        {
            return Unauthorized("Invalid username/email or password");
        }

        var result = await _signInManager.PasswordSignInAsync(
            user,
            model.Password,
            model.RememberMe,
            lockoutOnFailure: false);

        if (result.Succeeded)
        {
            var token = GenerateJwtToken(user);
            return Ok(new
            {
                Token = token,
                User = new UserDTO
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    StatusVisibility = user.StatusVisibility,
                    Avatar = user.Avatar
                }
            });
        }

        return Unauthorized("Invalid username/email or password");
    }


    [HttpPost("logout")]
    [Authorize] // Требует аутентификации
    public async Task<IActionResult> Logout()
    {
        // Получаем токен из заголовка
        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

        // Добавляем токен в чёрный список (если используете такую систему)
        // _tokenService.BlacklistToken(token);

        await _signInManager.SignOutAsync();
        return Ok(new { Message = "Logged out successfully" });
    }

    [HttpGet("current")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(new UserDTO
        {
            Id = user.Id,
            UserName = user.UserName,
            StatusVisibility = user.StatusVisibility,
            Avatar = user.Avatar
        });
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.Now.AddDays(Convert.ToDouble(
            _configuration["Jwt:ExpireDays"]));

        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Issuer"],
            claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateOptimizedDefaultAvatar(string username)
    {
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
}
}