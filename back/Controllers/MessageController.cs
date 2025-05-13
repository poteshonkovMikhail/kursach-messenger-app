// MessageController.cs
using Messenger.DTOs;
using Messenger.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;

namespace Messenger.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("CorsPolicy")]
    public class MessagesController : ControllerBase
    {
        private readonly MessengerDbContext _context;

        public MessagesController(MessengerDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Message>> GetMessage(string id)
        {
            var message = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Chat)
                .FirstOrDefaultAsync(m => m.MessageId == id);

            return message ?? (ActionResult<Message>)NotFound();
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MessageDTO>>> GetMessages()
        {
            return await _context.Messages
                .Select(m => new MessageDTO
                {
                    MessageId = m.MessageId,
                    Sender = m.Sender,
                    ChatOrGroupChatId = m.ChatOrGroupChatId,
                    Content = m.Content,
                    Timestamp = m.Timestamp
                })
                .AsNoTracking()
                .ToListAsync();
        }

        [HttpGet("chat/{chatId}")]
        public async Task<ActionResult<IEnumerable<MessageDTO>>> GetMessagesForChat(string chatId)
        {
            return await _context.Messages
                .Where(m => m.ChatOrGroupChatId == chatId)
                .Include(m => m.Sender)
                .OrderBy(m => m.Timestamp)
                .Select(m => new MessageDTO
                {
                    MessageId = m.MessageId,
                    Sender = m.Sender,
                    ChatOrGroupChatId = m.ChatOrGroupChatId,
                    Content = m.Content,
                    Timestamp = m.Timestamp
                })
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<MessageDTO>> CreateMessage([FromBody] MessageDTO messageDto)
        {
            if (messageDto.Sender == null || string.IsNullOrEmpty(messageDto.Sender.Id))
                return BadRequest("Sender information is required");

            var sender = await _context.Users.FindAsync(messageDto.Sender.Id);
            if (sender == null)
                return BadRequest("Sender not found");

            var chat = await _context.Chats.FindAsync(messageDto.ChatOrGroupChatId);
            if (chat == null)
                return BadRequest("Chat not found");

            var message = new Message(sender, messageDto.Content, chat)
            {
                Timestamp = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            messageDto.MessageId = message.MessageId;
            messageDto.Timestamp = message.Timestamp;
            messageDto.Sender = sender;


            return CreatedAtAction(nameof(GetMessagesForChat), new { chatId = messageDto.ChatOrGroupChatId }, messageDto);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMessage(string id, Message message)
        {
            if (id != message.MessageId) return BadRequest();

            _context.Entry(message).State = EntityState.Modified;

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!MessageExists(id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(string id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null) return NotFound();

            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool MessageExists(string id) => _context.Messages.Any(e => e.MessageId == id);
    }
}