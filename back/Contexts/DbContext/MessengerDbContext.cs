// MessengerDbContext.cs
using Messenger.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

public class MessengerDbContext : IdentityDbContext<User>
{
    public DbSet<Chat> Chats { get; set; }
    public DbSet<GroupChat> GroupChats { get; set; }
    public DbSet<Message> Messages { get; set; }

    public MessengerDbContext(DbContextOptions<MessengerDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Настройка связей для Chat
        modelBuilder.Entity<Chat>()
            .HasOne(c => c.User1)
            .WithMany(u => u.ChatsAsUser1)
            .HasForeignKey(c => c.User1Id)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Chat>()
            .HasOne(c => c.User2)
            .WithMany(u => u.ChatsAsUser2)
            .HasForeignKey(c => c.User2Id)
            .OnDelete(DeleteBehavior.Restrict);

        // Настройка UserGroupChat
        modelBuilder.Entity<UserGroupChat>()
            .HasKey(ugc => new { ugc.UserId, ugc.GroupChatId });

        modelBuilder.Entity<UserGroupChat>()
            .HasOne(ugc => ugc.User)
            .WithMany(u => u.UserGroupChats)
            .HasForeignKey(ugc => ugc.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserGroupChat>()
            .HasOne(ugc => ugc.GroupChat)
            .WithMany(gc => gc.UserGroupChats)
            .HasForeignKey(ugc => ugc.GroupChatId)
            .OnDelete(DeleteBehavior.Cascade);

        // Настройка Message
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.SentMessages)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        /*modelBuilder.Entity<Message>()
            .HasOne(m => m.Chat)
            .WithMany(u => u.ReceivedMessag)
            .HasForeignKey(m => m.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);*/

        // Настройка GroupChat
        modelBuilder.Entity<GroupChat>()
            .Property(gc => gc.UserRoles)
            .HasColumnType("jsonb")
            .HasConversion(
                v => JsonConvert.SerializeObject(v),
                v => JsonConvert.DeserializeObject<Dictionary<string, string>>(v));
    }
}