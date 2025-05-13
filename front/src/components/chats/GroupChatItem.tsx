// src/components/chats/GroupChatItem.tsx
import { Avatar, Badge, ListItem, ListItemAvatar, ListItemText, Typography, ListItemButton } from '@mui/material';
import { GroupChat } from '../../types';
import GroupsIcon from '@mui/icons-material/Groups';

interface GroupChatItemProps {
  groupChat: GroupChat;
  onClick: (groupChat: GroupChat) => void;
}

export const GroupChatItem = ({ groupChat, onClick }: GroupChatItemProps) => {
  const lastMessage = groupChat.messages?.[0];
    const handleClick = () => {
      onClick(groupChat); // Теперь передаём весь объект groupChat
    };

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={handleClick} sx={{ px: 2, py: 1.5 }}>
        <ListItemAvatar>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={<GroupsIcon fontSize="small" sx={{ color: 'primary.main' }} />}
          >
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {groupChat.title?.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={groupChat.title}
          secondary={
            lastMessage 
              ? `${lastMessage.sender?.userName}: ${lastMessage.content.substring(0, 30)}${lastMessage.content.length > 30 ? '...' : ''}`
              : 'No messages yet'
          }
          secondaryTypographyProps={{ noWrap: true }}
        />
        {lastMessage?.timestamp && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            {new Date(lastMessage.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        )}
      </ListItemButton>
    </ListItem>
  );
};