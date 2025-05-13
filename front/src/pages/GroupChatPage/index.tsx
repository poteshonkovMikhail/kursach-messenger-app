// src/pages/GroupChatPage/index.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSignalR } from '../../hooks/useSignalR';
import { GroupChatHeader } from './GroupChatHeader';
import { GroupChatMessages } from './GroupChatMessages';
import { GroupChatInput } from './GroupChatInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { 
  getGroupChatById, 
  getParticipants,
  addParticipant,
  removeParticipant,
  updateUserRole
} from '../../api/groupChat';
import { sendMessage } from '../../api/message';
import { getUsers } from '../../api/user';
import { GroupChat, Participant, Message, User } from '../../types';
import { Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Select, 
    FormControl, 
    InputLabel, 
    MenuItem, 
    Box, 
    Typography, 
    ListItemAvatar, 
    Avatar, 
    ListItemText 
} from '@mui/material';
import { TypingStatusDto } from '../../types';

export const GroupChatPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [groupChat, setGroupChat] = useState<GroupChat | null>(location.state?.groupChat || null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'Promoter' | 'Member'>('Member');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = groupChat?.admin.id === currentUser?.id;
  const currentUserRole = groupChat?.userRoles[currentUser?.userName || ''] as 'Admin' | 'Promoter' | 'Member' | undefined;


    

  const handleRoleChange = async () => {
      if (!groupId || !selectedParticipant || !currentUser?.userName) return;
      
      try {
          await updateUserRole(
              groupId,
              selectedParticipant.username,
              selectedRole,
              currentUser.userName
          );
          
          // Обновляем локальное состояние
          setGroupChat(prev => {
              if (!prev) return null;
              
              const newUserRoles = {
                  ...prev.userRoles,
                  [selectedParticipant.username]: selectedRole
              };
              
              return {
                  ...prev,
                  userRoles: newUserRoles,
                  participants: prev.participants.map(p => 
                      p.username === selectedParticipant.username 
                          ? { ...p, role: selectedRole } 
                          : p
                  )
              };
          });
          
          setRoleDialogOpen(false);
      } catch (error) {
          console.error('Error updating role:', error);
      }
  };


  // SignalR hooks
// Fixing the handleNewMessage function in GroupChatPage
const handleNewMessage = useCallback((message: Message) => {
    if (message.chatOrGroupChatId === groupId) {
      setGroupChat(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          messages: [...(prev.messages || []), message],
          admin: prev.admin, // Explicitly include admin to maintain type
          id: prev.id,
          title: prev.title,
          participants: prev.participants
          //userRoles: prev.userRoles
        };
      });
    }
  }, [groupId]);
  
  // Fixing the handleEditedMessage function
  const handleEditedMessage = useCallback((message: Message) => {
    setGroupChat(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        messages: (prev.messages || []).map(m => m.messageId === message.messageId ? message : m),
        admin: prev.admin,
        id: prev.id,
        title: prev.title,
        participants: prev.participants,
        //userRoles: prev.userRoles
      };
    });
  }, []);
  
  // Fixing the handleDeletedMessage function
  const handleDeletedMessage = useCallback((messageId: string) => {
    setGroupChat(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        messages: (prev.messages || []).filter(m => m.messageId !== messageId),
        admin: prev.admin,
        id: prev.id,
        title: prev.title,
        participants: prev.participants,
        userRoles: prev.userRoles
      };
    });
  }, []);
  
  const { sendMessage: sendSignalRMessage, editMessage, deleteMessage } = useSignalR({
    chatId: groupId,
    isGroupChat: true,
    currentUser, // Добавляем currentUser
    onNewMessage: handleNewMessage,
    onEditedMessage: handleEditedMessage,
    onDeletedMessage: handleDeletedMessage,
  });

  // Data fetching
  const fetchGroupChat = async () => {
    if (!groupId) {
      setError('Group ID is missing');
      return;
    }
    try {
      const response = await getGroupChatById(groupId);
      if (!response) throw new Error('Group chat not found');
      setGroupChat(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load group chat');
    }
  };
  
  const fetchParticipants = async () => {
    if (!groupId) return;
    try {
      const data = await getParticipants(groupId);
      setParticipants(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  // Handlers
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupChat || !currentUser?.id || !groupId) return;
  
    try {
      setSending(true);
      await sendSignalRMessage(groupId, newMessage, currentUser.id);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleAddUserClick = async () => {
    try {
      const allUsers = await getUsers();
      const currentParticipantIds = participants.map(p => p.id);
      const available = allUsers.filter(user => 
        !currentParticipantIds.includes(user.id) && user.id !== currentUser?.id
      );
      setAvailableUsers(available);
      setAddUserDialogOpen(true);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddUser = async () => {
    if (!groupId || !selectedUser || !currentUser?.id) return;
    try {
      await addParticipant(groupId, selectedUser, currentUser.id);
      await updateUserRole(groupId, selectedUser, 'Member', currentUser.id);
      setAddUserDialogOpen(false);
      setSelectedUser('');
      await fetchParticipants();
      await fetchGroupChat();
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  const handleStartEdit = (message: Message) => {
    setEditingMessageId(message.messageId ?? null);
    setEditedContent(message.content ?? '');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedContent('');
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editedContent.trim() || !currentUser?.id) return;
    try {
      await editMessage(editingMessageId, editedContent, currentUser.id);
      setEditingMessageId(null);
      setEditedContent('');
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  // Effects
  useEffect(() => {
    if (!groupId) {
      navigate('/chats');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchGroupChat(), fetchParticipants()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [groupId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupChat?.messages]);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorPage error={error} onBack={() => navigate('/chats')} />;
if (!groupChat || !groupChat.admin) return <LoadingSpinner />; 

  return (
    <Box display="flex" flexDirection="column" height="100vh" bgcolor="background.default">
      <GroupChatHeader 
        title={groupChat.title} 
        isAdmin={isAdmin} 
        onAddUser={handleAddUserClick}
      />

      <GroupChatMessages
        messages={groupChat.messages || []}
        currentUserId={currentUser?.id}
        onEditMessage={handleStartEdit}
        editingMessageId={editingMessageId}
        editedContent={editedContent}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onContentChange={setEditedContent}
      />
      <div ref={messagesEndRef} />

      <GroupChatInput
        newMessage={newMessage}
        sending={sending}
        currentUserRole={currentUserRole}
        onMessageChange={setNewMessage}
        onSubmit={handleSendMessage}
      />

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onClose={() => setAddUserDialogOpen(false)}>
        <DialogTitle>Add Participant</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select User</InputLabel>
            <Select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value as string)}
              label="Select User"
            >
              {availableUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <ListItemAvatar>
                    <Avatar src={user.avatar}>
                      {user.userName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.userName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUser} disabled={!selectedUser}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle>Change Role for {selectedParticipant?.username}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as 'Admin' | 'Promoter' | 'Member')}
              label="Role"
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Promoter">Promoter</MenuItem>
              <MenuItem value="Member">Member</MenuItem>
            </Select>
          </FormControl>
          {selectedRole === 'Admin' && selectedParticipant?.id !== currentUser?.id && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Note: Assigning Admin role to this user will demote you to Member.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRoleChange}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const ErrorPage = ({ error, onBack }: { error: string; onBack: () => void }) => (
  <Box display="flex" height="100vh" alignItems="center" justifyContent="center">
    <Typography color="error">{error}</Typography>
    <Button onClick={onBack} sx={{ ml: 2 }}>Back to chats</Button>
  </Box>
);