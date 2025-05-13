//GroupChat.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Messenger.Models
{
    public class GroupChat : ChatsBase
    {
        public string Title { get; set; }

        public string AdminId { get; set; }

        public User Admin { get; set; }

        public List<Participant> Participants { get; set; }

        public Dictionary<string, string> UserRoles { get; set; }

        public List<Message> Messages { get; set; }

        [JsonIgnore]
        public List<UserGroupChat> UserGroupChats { get; set; }


        public GroupChat()
        {
            Id = Guid.NewGuid().ToString();
            Participants = new List<Participant>();
            UserRoles = new Dictionary<string, string>();
            Messages = new List<Message>();
        }

        public GroupChat(string title, User admin, List<User> users) : this()
        {
            Title = title;
            Admin = admin;
            AdminId = admin.Id;

            Participants = users.Select(u => new Participant
            {
                Id = u.Id,
                Username = u.UserName,
                Avatar = u.Avatar,
                Role = u.Id == admin.Id ? "Admin" : "Member",
                StatusVisibility = "public"
            }).ToList();

            foreach (var user in users)
            {
                UserRoles[user.UserName] = user.Id == admin.Id ? "Admin" : "Member";
            }
        }

        public void AddMessage(Message message)
        {
            Messages.Add(message);
        }

        public void AssignRole(string username, string role)
        {
            UserRoles[username] = role;
        }

    }

    public class Participant
{
    [Column(TypeName = "text")]
    public string Id { get; set; }
    
    [Column(TypeName = "text")]
    public string Username { get; set; }
    
    [Column(TypeName = "text")]
    public string Avatar { get; set; }
    
    [Column(TypeName = "text")]
    public string Role { get; set; }
    
    [Column(TypeName = "text")]
    public string StatusVisibility { get; set; }
}
}