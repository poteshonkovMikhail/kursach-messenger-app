using Messenger.Models;
using System.Collections.Generic;
using Xunit;

namespace Messenger.Tests.Models
{
    public class GroupChatTests
    {
        [Fact]
        public void GroupChat_Constructor_InitializesProperties()
        {
            // Arrange
            var admin = new User("admin");
            var participants = new List<User> { new User("user1"), new User("user2") };
            var title = "Test Group";

            // Act
            var groupChat = new GroupChat(title, admin, participants);

            // Assert
            Assert.NotEqual(Guid.Empty, groupChat.GroupChatId);
            Assert.Equal(title, groupChat.Title);
            Assert.Equal(admin, groupChat.Admin);
            Assert.Equal(3, groupChat.Participants.Count); // admin + 2 participants
            Assert.Equal("Admin", groupChat.UserRoles["admin"]);
            Assert.Equal("Member", groupChat.UserRoles["user1"]);
            Assert.Equal("Member", groupChat.UserRoles["user2"]);
            Assert.Empty(groupChat.Messages);
        }

        [Fact]
        public void GroupChat_AssignRole_UpdatesRole()
        {
            // Arrange
            var groupChat = new GroupChat();
            var username = "testuser";

            // Act
            groupChat.AssignRole(username, "Moderator");

            // Assert
            Assert.Equal("Moderator", groupChat.UserRoles[username]);
        }

        [Fact]
        public void GroupChat_AddMessage_AddsToCollection()
        {
            // Arrange
            var groupChat = new GroupChat();
            var user = new User("sender");
            var chat = new Chat(new User("u1"), new User("u2"));
            var message = new Message(user, "Test message", chat);

            // Act
            groupChat.AddMessage(message);

            // Assert
            Assert.Single(groupChat.Messages);
            Assert.Equal(message, groupChat.Messages[0]);
        }
    }
}