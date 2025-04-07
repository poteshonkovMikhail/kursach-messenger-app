using Messenger.Models;
using Xunit;

namespace Messenger.Tests.Models
{
    public class UserTests
    {
        [Fact]
        public void User_Constructor_InitializesProperties()
        {
            // Arrange & Act
            var username = "testuser";
            var user = new User(username);

            // Assert
            Assert.Equal(username, user.UserName);
            Assert.Equal("public", user.Status);
            Assert.Null(user.Avatar);
            Assert.Empty(user.ChatsAsUser1);
            Assert.Empty(user.ChatsAsUser2);
            Assert.Empty(user.SentMessages);
            Assert.Empty(user.ReceivedMessages);
        }

        [Fact]
        public void User_UpdateStatus_ChangesStatus()
        {
            // Arrange
            var user = new User("testuser");
            var newStatus = "away";

            // Act
            user.UpdateStatus(newStatus);

            // Assert
            Assert.Equal(newStatus, user.Status);
        }

        [Fact]
        public void User_GetAllChats_ReturnsCombinedChats()
        {
            // Arrange
            var user = new User("testuser");
            var user1 = new User("user1");
            var user2 = new User("user2");

            // Явно добавляем чаты в коллекции пользователя
            user.ChatsAsUser1.Add(new Chat(user, user1));
            user.ChatsAsUser2.Add(new Chat(user2, user));

            // Act
            var allChats = user.GetAllChats();

            // Assert
            Assert.Equal(2, allChats.Count());
        }
    }
}