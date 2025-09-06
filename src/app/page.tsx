'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatList from '@/components/ChatList';
import { MessageInput } from '@/components/MessageInput';

interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnline: boolean;
}

interface Chat {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupMembers?: User[];
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock authentication check
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
      loadChats();
    }
  }, []);

  const loadChats = () => {
    // Mock chat data
    const mockChats: Chat[] = [
      {
        id: '1',
        participant: {
          id: '2',
          name: 'Sarah Johnson',
          phone: '+1234567890',
          avatar: 'https://placehold.co/40x40?text=Profile+photo+of+Sarah+Johnson',
          isOnline: true
        },
        lastMessage: 'Hey! How are you doing?',
        lastMessageTime: '2 min ago',
        unreadCount: 2,
        isGroup: false
      },
      {
        id: '2',
        participant: {
          id: '3',
          name: 'Mike Chen',
          phone: '+1987654321',
          avatar: 'https://placehold.co/40x40?text=Profile+photo+of+Mike+Chen',
          isOnline: false
        },
        lastMessage: 'Thanks for the help!',
        lastMessageTime: '1 hour ago',
        unreadCount: 0,
        isGroup: false
      },
      {
        id: '3',
        participant: {
          id: '4',
          name: 'Family Group',
          phone: '',
          avatar: 'https://placehold.co/40x40?text=Family+group+chat+avatar',
          isOnline: true
        },
        lastMessage: 'Mom: Dinner at 7pm everyone!',
        lastMessageTime: '3 hours ago',
        unreadCount: 1,
        isGroup: true,
        groupName: 'Family Group',
        groupMembers: [
          { id: '5', name: 'Mom', phone: '+1111111111', isOnline: true },
          { id: '6', name: 'Dad', phone: '+2222222222', isOnline: false },
          { id: '7', name: 'Sister', phone: '+3333333333', isOnline: true }
        ]
      }
    ];
    setChats(mockChats);
  };



  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Mobile Messenger
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Connect with anyone, anywhere
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <img 
                src="https://placehold.co/200x150?text=Mobile+messaging+app+welcome+screen+illustration" 
                alt="Mobile messaging app welcome screen illustration"
                className="mx-auto mb-4 rounded-lg"
              />
            </div>
            <Button 
              onClick={() => window.location.href = '/auth'} 
              className="w-full"
              size="lg"
            >
              Get Started
            </Button>
            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredChats = chats.filter(chat => 
    chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>
                  {currentUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {currentUser?.name || 'User'}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  Online
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              ⋮
            </Button>
          </div>
          
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <ChatList 
            chats={filteredChats}
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
          />
        </ScrollArea>

        {/* Add Contact Button */}
        <div className="p-4 border-t border-gray-200">
          <Button variant="outline" className="w-full" size="sm">
            + Add New Contact
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedChat.participant.avatar} />
                  <AvatarFallback>
                    {selectedChat.participant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedChat.participant.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedChat.participant.isOnline ? 'Online' : 'Last seen recently'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">📞</Button>
                <Button variant="ghost" size="sm">📹</Button>
                <Button variant="ghost" size="sm">⋮</Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4">
                {/* Sample Messages */}
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl max-w-xs">
                    <p>Hello! How are you?</p>
                    <p className="text-xs opacity-75 mt-1">2:30 PM</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-2 rounded-2xl max-w-xs border">
                    <p>{selectedChat.lastMessage}</p>
                    <p className="text-xs text-gray-500 mt-1">2:32 PM</p>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Message Input */}
            <MessageInput onSendMessage={(message) => console.log('Send:', message)} />
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <img 
                src="https://placehold.co/300x200?text=Select+a+chat+to+start+messaging+illustration" 
                alt="Select a chat to start messaging illustration"
                className="mx-auto mb-4 opacity-50"
              />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Select a chat to start messaging
              </h3>
              <p className="text-gray-500">
                Choose from your existing conversations or start a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}