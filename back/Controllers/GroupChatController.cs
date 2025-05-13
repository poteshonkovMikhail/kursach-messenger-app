// GroupChatController.cs
using Messenger.DTOs;
using Messenger.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;


namespace Messenger.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("CorsPolicy")]
    public class GroupChatsController : ControllerBase
    {
        private readonly MessengerDbContext _context;

        public GroupChatsController(MessengerDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GroupChat>>> GetGroupChats()
        {
            return await _context.GroupChats
                .Include(gc => gc.Messages)
                .Include(gc => gc.Participants)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GroupChat>> GetGroupChat(string id)
        {
            var groupChat = await _context.GroupChats
                .Include(gc => gc.Admin)
                .Include(gc => gc.Messages)
                .Include(gc => gc.Participants)
                .FirstOrDefaultAsync(gc => gc.Id == id);

            return groupChat ?? (ActionResult<GroupChat>)NotFound();
        }

        /*[HttpPost]
        public async Task<ActionResult<GroupChat>> CreateGroupChat(GroupChatDTO groupChatDTO)
        {
            var admin = await _context.Users.FindAsync(groupChatDTO.AdminId);
            var users = await _context.Users
                .Where(u => groupChatDTO.ParticipantIds.Contains(u.Id))
                .ToListAsync();

            if (admin == null) return BadRequest("Admin not found");

            var groupChat = new GroupChat
            {
                Id = groupChatDTO.GroupChatId,
                Title = groupChatDTO.Title,
                Admin = admin,
                Participants = MakeUsersParticipants(users), // Просто используем существующих пользователей
                UserRoles = users.ToDictionary(
                    u => u.UserName,
                    u => u.Id == admin.Id ? "Admin" : "Member")
            };

            _context.GroupChats.Add(groupChat);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGroupChat), new { id = groupChat.Id }, groupChat);
        }*/

        [HttpPost]
        public async Task<ActionResult<GroupChat>> CreateGroupChat(GroupChatDTO groupChatDTO)
        {
            var admin = await _context.Users.FindAsync(groupChatDTO.AdminId);
            var users = await _context.Users
                .Where(u => groupChatDTO.ParticipantIds.Contains(u.Id))
                .ToListAsync();

            if (admin == null) return BadRequest("Admin not found");

            // Создаем список участников
            var participants = users.Select(u => new Participant
            {
                Id = u.Id,
                Username = u.UserName,
                Avatar = u.Avatar,
                Role = u.Id == admin.Id ? "Admin" : "Member",
                StatusVisibility = "online"
            }).ToList();

            var groupChat = new GroupChat
            {
                Id = groupChatDTO.GroupChatId,
                Title = groupChatDTO.Title,
                Admin = admin,
                Participants = participants, // Теперь передаем правильный тип
                UserRoles = users.ToDictionary(
                    u => u.UserName,
                    u => u.Id == admin.Id ? "Admin" : "Member")
            };

            _context.GroupChats.Add(groupChat);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGroupChat), new { id = groupChat.Id }, groupChat);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGroupChat(string id, GroupChat groupChat)
        {
            if (id != groupChat.Id) return BadRequest();

            _context.Entry(groupChat).State = EntityState.Modified;

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!GroupChatExists(id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGroupChat(string id)
        {
            var groupChat = await _context.GroupChats.FindAsync(id);
            if (groupChat == null) return NotFound();

            _context.GroupChats.Remove(groupChat);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool GroupChatExists(string id) => _context.GroupChats.Any(e => e.Id == id);


        // GroupChatController.cs
        [HttpPost("{groupId}/roles")]
        public async Task<IActionResult> UpdateUserRole(string groupId, [FromBody] UpdateRoleRequest request)
        {
            var groupChat = await _context.GroupChats
                .Include(gc => gc.Participants)
                .FirstOrDefaultAsync(gc => gc.Id == groupId);

            if (groupChat == null) return NotFound("Group chat not found");

            // Only admin can change roles
            if (groupChat.Admin.Id != request.RequestingUserId)
                return Unauthorized("Only admin can change roles");

            var user = groupChat.Participants.FirstOrDefault(u => u.Id == request.UserId);
            if (user == null) return BadRequest("User is not a participant");

            groupChat.AssignRole(user.Username, user.Role);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{groupId}/participants")]
        public async Task<ActionResult<IEnumerable<ParticipantDTO>>> GetParticipants(string groupId)
        {
            var groupChat = await _context.GroupChats
                .Include(gc => gc.Participants)
                .FirstOrDefaultAsync(gc => gc.Id == groupId);

            if (groupChat == null) return NotFound();

            var participants = groupChat.Participants.Select(p => new ParticipantDTO
            {
                Id = p.Id,
                Username = p.Username,
                Avatar = p.Avatar,
                Role = groupChat.UserRoles[p.Username]
            });

            return Ok(participants);
        }


        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<GroupChatResponse>>> GetUserGroupChats(string userId)
        {
            var groupChats = await _context.GroupChats
                .Include(gc => gc.Admin)
                .Include(gc => gc.Participants)
                .Include(gc => gc.Messages)
                .ThenInclude(m => m.Sender)
                .Where(gc => gc.Admin.Id == userId || gc.Participants.Any(p => p.Id == userId))
                .Select(gc => new GroupChatResponse
                {
                    Id = gc.Id,
                    Title = gc.Title,
                    Admin = new GroupChatUserDTO // Changed to match actual type
                    {
                        Id = gc.Admin.Id,
                        Username = gc.Admin.UserName,
                        Avatar = gc.Admin.Avatar,
                        StatusVisibility = gc.Admin.StatusVisibility
                    },
                    Participants = gc.Participants.Select(p => new ParticipantDTO
                    {
                        Id = p.Id,
                        Username = p.Username,
                        Avatar = p.Avatar,
                        Role = p.Role,
                        StatusVisibility = p.StatusVisibility
                    }).ToList(),
                    Messages = gc.Messages.Select(m => new GroupChatMessageDTO // Changed to match actual type
                    {
                        MessageId = m.MessageId,
                        Sender = new GroupChatUserDTO
                        {
                            Id = m.Sender.Id,
                            Username = m.Sender.UserName,
                            Avatar = m.Sender.Avatar,
                            StatusVisibility = m.Sender.StatusVisibility
                        },
                        Content = m.Content,
                        Timestamp = m.Timestamp
                    }).ToList(),
                    UserRoles = gc.UserRoles
                })
                .ToListAsync();

            return Ok(groupChats);
        }

        [HttpPost("{groupId}/add")]
        public async Task<IActionResult> AddParticipant(string groupId, [FromBody] AddParticipantRequest request)
        {
            var groupChat = await _context.GroupChats
                .Include(gc => gc.Participants)
                .FirstOrDefaultAsync(gc => gc.Id == groupId);

            if (groupChat == null) return NotFound("Group chat not found");

            // Only admin can add participants
            if (groupChat.Admin.Id != request.RequestingUserId)
                return Unauthorized("Only admin can add participants");

            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null) return BadRequest("User not found");

            if (groupChat.Participants.Any(p => p.Id == user.Id))
                return BadRequest("User is already a participant");

            // Создаем нового участника
            var participant = new Participant
            {
                Id = user.Id,
                Username = user.UserName,
                Avatar = user.Avatar,
                Role = "Member",
                StatusVisibility = "online"
            };

            groupChat.Participants.Add(participant);
            groupChat.UserRoles[user.UserName] = "Member";
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{groupId}/remove")]
        public async Task<IActionResult> RemoveParticipant(string groupId, [FromBody] RemoveParticipantRequest request)
        {
            var groupChat = await _context.GroupChats
                .Include(gc => gc.Participants)
                .FirstOrDefaultAsync(gc => gc.Id == groupId);

            if (groupChat == null) return NotFound("Group chat not found");

            // Only admin can remove participants
            if (groupChat.Admin.Id != request.RequestingUserId)
                return Unauthorized("Only admin can remove participants");

            var participant = groupChat.Participants.FirstOrDefault(p => p.Id == request.UserId);
            if (participant == null) return BadRequest("User is not a participant");

            // Can't remove admin
            if (participant.Id == groupChat.Admin.Id)
                return BadRequest("Cannot remove admin from group");

            groupChat.Participants.Remove(participant);
            groupChat.UserRoles.Remove(participant.Username);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        public class AddParticipantRequest
        {
            public string RequestingUserId { get; set; }
            public string UserId { get; set; }
        }

        public class RemoveParticipantRequest
        {
            public string RequestingUserId { get; set; }
            public string UserId { get; set; }
        }

        public class UpdateRoleRequest
        {
            public string RequestingUserId { get; set; }
            public string UserId { get; set; }
            public string NewRole { get; set; }
        }

        public class GroupChatResponse
        {
            public string Id { get; set; }
            public string Title { get; set; }
            public GroupChatUserDTO Admin { get; set; }
            public List<ParticipantDTO> Participants { get; set; }
            public List<GroupChatMessageDTO> Messages { get; set; }
            public Dictionary<string, string> UserRoles { get; set; }
        }

        public class ParticipantDTO
        {
            public string Id { get; set; }
            public string Username { get; set; }
            public string Avatar { get; set; }
            public string Role { get; set; }
            public string StatusVisibility { get; set; }
        }

        public class GroupChatUserDTO
        {
            public string Id { get; set; }
            public string Username { get; set; }
            public string Avatar { get; set; }
            public string StatusVisibility { get; set; }
        }

        public class GroupChatMessageDTO
        {
            public string MessageId { get; set; }
            public GroupChatUserDTO Sender { get; set; }
            public string Content { get; set; }
            public DateTime Timestamp { get; set; }
        }
    }
}