// GroupChat.cs
using Messenger.Models;
using System.Collections.Generic;
using System.Text.Json.Serialization;

public class GroupChat
{
    public Guid GroupChatId { get; set; }
    public string Title { get; set; }
    public User Admin { get; set; }
    public List<User> Participants { get; set; }
    public Dictionary<string, string> UserRoles { get; set; }

    public List<Message> Messages { get; private set; }

    [JsonIgnore]
    public List<UserGroupChat> UserGroupChats { get; set; }

    public GroupChat()
    {
        GroupChatId = Guid.NewGuid();
        Participants = new List<User>();
        UserRoles = new Dictionary<string, string>();
        Messages = new List<Message>();
    }

    public GroupChat(string title, User admin, List<User> participants) : this()
    {
        Title = title;
        Admin = admin;
        Participants.Add(admin);
        AssignRole(admin.UserName, "Admin");
        Participants.AddRange(participants);
        foreach (var participant in participants)
        {
            AssignRole(participant.UserName, "Member");
        }
    }

    public void AssignRole(string username, string role)
    {
        UserRoles[username] = role;
    }

    public void AddMessage(Message message)
    {
        Messages.Add(message);
    }
}