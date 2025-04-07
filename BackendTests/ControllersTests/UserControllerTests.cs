using Messenger.Controllers;
using Messenger.DTOs;
using Messenger.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Threading.Tasks;
using Xunit;

namespace Messenger.Tests.Controllers
{
    public class UsersControllerTests
    {
        private readonly Mock<MessengerDbContext> _mockContext;
        private readonly Mock<UserManager<User>> _mockUserManager;
        private readonly UsersController _controller;

        public UsersControllerTests()
        {
            var options = new DbContextOptionsBuilder<MessengerDbContext>()
                .Options;
            _mockContext = new Mock<MessengerDbContext>(options);

            var store = new Mock<IUserStore<User>>();
            _mockUserManager = new Mock<UserManager<User>>(
                store.Object,
                null, null, null, null, null, null, null, null);

            _controller = new UsersController(_mockContext.Object, _mockUserManager.Object);
        }

        [Fact]
        public async Task GetUserByUsername_ExistingUser_ReturnsUser()
        {
            // Arrange
            var user = new User("testuser")
            {
                Id = "1",
                Status = "online",
                Avatar = "#3B82F6"
            };

            _mockUserManager.Setup(x => x.FindByNameAsync(It.IsAny<string>()))
                .ReturnsAsync(user);

            // Act
            var result = await _controller.GetUserByUsername("testuser");

            // Assert
            var actionResult = Assert.IsType<ActionResult<UserDTO>>(result);
            var okResult = Assert.IsType<UserDTO>(actionResult.Value);
            Assert.Equal("testuser", okResult.Username);
            Assert.Equal("online", okResult.Status);
            Assert.Equal("#3B82F6", okResult.Avatar);
        }

        [Fact]
        public async Task GetUserByUsername_NonExistingUser_ReturnsNotFound()
        {
            // Arrange
            _mockUserManager.Setup(x => x.FindByNameAsync(It.IsAny<string>()))
                .ReturnsAsync((User)null);

            // Act
            var result = await _controller.GetUserByUsername("nonexisting");

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task UpdateUser_ValidData_UpdatesUser()
        {
            // Arrange
            var userId = "9fbcf048-4ed6-4cd9-a019-f6dd53bee768";
            var user = new User("oldusername") { Id = userId, Status = "offline" };
            var userDto = new UserDTO
            {
                Id = userId,
                Username = "newusername",
                Status = "busy",
                Avatar = "#EF4444"
            };

            _mockContext.Setup(c => c.Users.FindAsync(userId))
                .ReturnsAsync(user);
            _mockUserManager.Setup(x => x.UpdateAsync(It.IsAny<User>()))
                .ReturnsAsync(IdentityResult.Success);

            // Act
            var result = await _controller.UpdateUser(userId, userDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Equal("newusername", user.UserName);
            Assert.Equal("busy", user.Status);
            Assert.Equal("#EF4444", user.Avatar);
        }

        [Fact]
        public async Task UpdateUser_NonExistingUser_ReturnsNotFound()
        {
            // Arrange
            var userId = "999";
            var userDto = new UserDTO { Id = userId, Username = "new" };

            _mockContext.Setup(c => c.Users.FindAsync(userId))
                .ReturnsAsync((User)null);

            // Act
            var result = await _controller.UpdateUser(userId, userDto);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task UpdateUser_UpdateFails_ReturnsBadRequest()
        {
            // Arrange
            var userId = "1";
            var user = new User("old") { Id = userId };
            var userDto = new UserDTO { Id = userId, Username = "new" };

            _mockContext.Setup(c => c.Users.FindAsync(userId))
                .ReturnsAsync(user);
            _mockUserManager.Setup(x => x.UpdateAsync(It.IsAny<User>()))
                .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error" }));

            // Act
            var result = await _controller.UpdateUser(userId, userDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }
    }
}