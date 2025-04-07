using Messenger.Models;
using Xunit;

namespace Messenger.Tests.Models
{
    public class MessageTests
    {
        [Fact]
        public void Message_Constructor_InitializesProperties()
        {
            // Arrange
            var sender = new User("sender");
            var chat = new Chat(new User("user1"), new User("user2"));
            var content = "Hello world";

            // Act
            var message = new Message(sender, content, chat);

            // Assert
            Assert.NotEqual(Guid.Empty, message.MessageId);
            Assert.Equal(content, message.Content);
            Assert.Equal(sender, message.Sender);
            Assert.Equal(chat.ChatId, message.ChatId);
            Assert.Equal(chat, message.Chat);
            Assert.True(DateTime.UtcNow.Subtract(message.Timestamp).TotalSeconds < 5);
        }
    }
}