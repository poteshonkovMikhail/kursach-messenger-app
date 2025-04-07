using Messenger.Models;
using Xunit;

namespace BackendTests.ModelsTests
{
    public class ChatTests
    {
        [Fact]
        public void Chat_Constructor_InitializesProperties()
        {
            // Arrange
            var user1 = new User("user1");
            var user2 = new User("user2");

            // Act
            var chat = new Chat(user1, user2);

            // Assert
            Assert.NotEqual(Guid.Empty, chat.ChatId);
            Assert.Equal(user1.Id, chat.User1Id);
            Assert.Equal(user2.Id, chat.User2Id);
            Assert.Equal(user1, chat.User1);
            Assert.Equal(user2, chat.User2);
            Assert.Empty(chat.Messages);
        }

        [Fact]
        public void Chat_AddMessage_AddsToCollection()
        {
            // Arrange
            var user1 = new User("user1");
            var user2 = new User("user2");
            var chat = new Chat(user1, user2);
            var message = new Message(user1, "Hello", chat);

            // Act
            chat.Messages.Add(message);

            // Assert
            Assert.Single(chat.Messages);
            Assert.Equal(message, chat.Messages[0]);
        }
    }
}