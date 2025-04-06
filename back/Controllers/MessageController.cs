// MessageController.cs
using Messenger.DTOs;
using Messenger.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;

[Route("api/[controller]")]
[ApiController]
[EnableCors("AllowAll")]
public class MessagesController : ControllerBase
{
    private readonly MessengerDbContext _context;

    public MessagesController(MessengerDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Message>> GetMessage(Guid id)
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
                ChatId = m.ChatId,
                Content = m.Content,
                Timestamp = m.Timestamp
            })
            .AsNoTracking()
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Message>> CreateMessage([FromBody] MessageDTO messageDto)
    {
        if (messageDto.Sender == null || string.IsNullOrEmpty(messageDto.Sender.Id))
            return BadRequest("Sender information is required");

        var sender = await _context.Users.FindAsync(messageDto.Sender.Id);
        if (sender == null)
            return BadRequest("Sender not found");

        var chat = await _context.Chats
            .Include(c => c.User1)
            .Include(c => c.User2)
            .FirstOrDefaultAsync(c => c.ChatId == messageDto.ChatId);

        if (chat == null)
            return BadRequest("Chat not found");

        var message = new Message(sender, messageDto.Content, chat)
        {
            Timestamp = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMessage), new { id = message.MessageId }, message);
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMessage(Guid id, Message message)
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
    public async Task<IActionResult> DeleteMessage(Guid id)
    {
        var message = await _context.Messages.FindAsync(id);
        if (message == null) return NotFound();

        _context.Messages.Remove(message);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private bool MessageExists(Guid id) => _context.Messages.Any(e => e.MessageId == id);
}