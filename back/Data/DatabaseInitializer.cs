using Messenger.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(MessengerDbContext context, UserManager<User> userManager)
    {
        // Проверяем, есть ли уже пользователи в базе
        if (await context.Users.AnyAsync())
        {
            return; // База уже инициализирована
        }

        // Создаем тестовых пользователей с аватарами
        var users = new List<User>
        {
            new User("user1")
            {
                Email = "user1@example.com",
                StatusVisibility = "online",
                Avatar = "#3B82F6" // Синий
            },
            new User("user2")
            {
                Email = "user2@example.com",
                StatusVisibility = "away",
                Avatar = "#EF4444" // Красный
            },
            new User("user3")
            {
                Email = "user3@example.com",
                StatusVisibility = "busy",
                Avatar = "#10B981" // Зеленый
            },
            new User("user4")
            {
                Email = "user4@example.com",
                StatusVisibility = "online",
                Avatar = "#8B5CF6" // Фиолетовый
            }
        };

        foreach (var user in users)
        {
            var result = await userManager.CreateAsync(user, "Password123!");
            if (!result.Succeeded)
            {
                throw new Exception($"Ошибка при создании пользователя {user.UserName}: {string.Join(", ", result.Errors)}");
            }
        }

        // Получаем пользователей после создания
        var user1 = await userManager.FindByNameAsync("user1");
        var user2 = await userManager.FindByNameAsync("user2");
        var user3 = await userManager.FindByNameAsync("user3");
        var user4 = await userManager.FindByNameAsync("user4");
        await context.SaveChangesAsync();

        
        // Создаем чаты между пользователями
        var chats = new List<Chat>
        {
            new Chat(user1, user2),
            new Chat(user1, user3),
            new Chat(user2, user4)
        };

        await context.Chats.AddRangeAsync(chats);
        await context.SaveChangesAsync();

        // Добавляем сообщения в чаты
        var messages = new List<Message>
        {
            new Message(user1, "Привет, user2!", chats[0])
            {
                Timestamp = DateTime.UtcNow.AddMinutes(-30)
            },
            new Message(user2, "Привет, user1! Как дела?", chats[0])
            {
                Timestamp = DateTime.UtcNow.AddMinutes(-25)
            },
            new Message(user1, "Ты готов к встрече завтра?", chats[1])
            {
                Timestamp = DateTime.UtcNow.AddMinutes(-20)
            },
            new Message(user3, "Да, конечно! В 15:00?", chats[1])
            {
                Timestamp = DateTime.UtcNow.AddMinutes(-15)
            },
            new Message(user2, "Отправил тебе файл с отчетом", chats[2])
            {
                Timestamp = DateTime.UtcNow.AddMinutes(-10)
            },
            new Message(user4, "Получил, спасибо!", chats[2])
            {
                Timestamp = DateTime.UtcNow.AddMinutes(-5)
            }
        };

        await context.Messages.AddRangeAsync(messages);
        await context.SaveChangesAsync();
    }
}