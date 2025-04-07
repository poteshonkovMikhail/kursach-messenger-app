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
    [EnableCors("AllowAll")]
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
        public async Task<ActionResult<GroupChat>> GetGroupChat(Guid id)
        {
            var groupChat = await _context.GroupChats
                .Include(gc => gc.Messages)
                .Include(gc => gc.Participants)
                .FirstOrDefaultAsync(gc => gc.GroupChatId == id);

            return groupChat ?? (ActionResult<GroupChat>)NotFound();
        }

        [HttpPost]
        public async Task<ActionResult<GroupChat>> CreateGroupChat(GroupChatDTO groupChatDTO)
        {
            var admin = await _context.Users.FindAsync(groupChatDTO.AdminId);
            var participants = await _context.Users
                .Where(u => groupChatDTO.ParticipantIds.Contains(u.Id))
                .ToListAsync();

            if (admin == null) return BadRequest("Admin not found");

            var groupChat = new GroupChat
            {
                GroupChatId = groupChatDTO.GroupChatId,
                Title = groupChatDTO.Title,
                Admin = admin,
                Participants = participants,
                UserRoles = groupChatDTO.UserRoles
            };

            _context.GroupChats.Add(groupChat);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGroupChat), new { id = groupChat.GroupChatId }, groupChat);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGroupChat(Guid id, GroupChat groupChat)
        {
            if (id != groupChat.GroupChatId) return BadRequest();

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
        public async Task<IActionResult> DeleteGroupChat(Guid id)
        {
            var groupChat = await _context.GroupChats.FindAsync(id);
            if (groupChat == null) return NotFound();

            _context.GroupChats.Remove(groupChat);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool GroupChatExists(Guid id) => _context.GroupChats.Any(e => e.GroupChatId == id);
    }
}