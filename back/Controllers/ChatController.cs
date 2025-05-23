﻿// ChatController.cs
using Messenger.DTOs;
using Messenger.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;
using Microsoft.EntityFrameworkCore.Query;

namespace Messenger.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("CorsPolicy")]
    public class ChatsController : ControllerBase
    {
        private readonly MessengerDbContext _context;

        public ChatsController(MessengerDbContext context)
        {
            _context = context;
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Chat>>> GetUserChats(
    string userId,
    [FromQuery] bool includeLastMessage = false)
        {
            IQueryable<Chat> query = _context.Chats
                .Where(c => c.User1Id == userId || c.User2Id == userId)
                .Include(c => c.User1)
                .Include(c => c.User2);

            if (includeLastMessage)
            {
                query = query
                    .Include(c => c.Messages
                        .OrderByDescending(m => m.Timestamp)
                        .Take(1))
                    .ThenInclude(m => m.Sender);
            }
            else
            {
                query = query.Include(c => c.Messages);
            }
        
            var chats = await query
                .OrderByDescending(c => c.Messages.Any() ?
                    c.Messages.Max(m => m.Timestamp) : DateTime.MinValue)
                .ToListAsync();


            return chats;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Chat>>> GetChats()
        {
            return await _context.Chats
                .Include(c => c.User1)
                .Include(c => c.User2)
                .Include(c => c.Messages)
                    .ThenInclude(m => m.Sender)
                .Include(c => c.Messages)
                //.ThenInclude(m => m.Receiver)
                .AsNoTracking()
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Chat>> GetChat(string id, [FromQuery] bool includeUsers = false)
        {
            var query = _context.Chats
                .Include(c => c.Messages)
                    .ThenInclude(m => m.Sender);

            if (includeUsers)
            {
                query = query
                    .Include(c => c.User1)
                    .Include(c => c.User2);
            }

            var chat = await query.FirstOrDefaultAsync(c => c.Id == id);

            if (chat == null) return NotFound();
            return chat;
        }

        [HttpPost]
        public async Task<ActionResult<Chat>> CreateChat(ChatDTO chatDTO)
        {
            var user1 = await _context.Users.FindAsync(chatDTO.User1Id);
            var user2 = await _context.Users.FindAsync(chatDTO.User2Id);

            if (user1 == null || user2 == null)
                return BadRequest("One or both users not found");

            var chat = new Chat(user1, user2);
            _context.Chats.Add(chat);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChat), new { id = chat.Id }, chat);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateChat(string id, Chat chat)
        {
            if (id != chat.Id) return BadRequest();

            _context.Entry(chat).State = EntityState.Modified;

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!ChatExists(id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChat(string id)
        {
            var chat = await _context.Chats.FindAsync(id);
            if (chat == null) return NotFound();

            _context.Chats.Remove(chat);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool ChatExists(string id) => _context.Chats.Any(e => e.Id == id);
    }
}