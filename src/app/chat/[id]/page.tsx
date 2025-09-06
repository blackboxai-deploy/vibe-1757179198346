'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageInput } from '@/components/MessageInput';
import { MessageBubble } from '@/components/MessageBubble';

interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface Chat {
  id: string;
  participant: User;
  messages: Message[];
  isGroup: boolean;
  groupName?: string;
  groupMembers?: User[];
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [chat, setChat] = useState<Chat | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get current user
    const user = localStorage.getItem('currentUser');
    if (!user) {
      router.push('/auth');
      return;
    }
    setCurrentUser(JSON.parse(user));

    // Load chat data (mock)
    loadChatData(params.id as string);
  }, [params.id, router]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const loadChatData = (chatId: string) => {
    // Mock chat data
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Hey there! How are you doing?',
        senderId: '2',
        timestamp: new Date(Date.now() - 3600000),
        type: 'text',
        status: 'read'
      },
      {
        id: '2',
        content: 'I\'m doing great, thanks for asking! How about you?',
        senderId: '1',
        timestamp: new Date(Date.now() - 3500000),
        type: 'text',
        status: 'read'
      },
      {
        id: '3',
        content: 'Just working on some projects. Want to grab coffee later?',
        senderId: '2',
        timestamp: new Date(Date.now() - 3000000),
        type: 'text',
        status: 'read'
      },
      {
        id: '4',
        content: 'That sounds perfect! What time works for you?',
        senderId: '1',
        timestamp: new Date(Date.now() - 2500000),
        type: 'text',
        status: 'delivered'
      },
      {
        id: '5',
        content: 'How about 3 PM at the usual place?',
        senderId: '2',
        timestamp: new Date(Date.now() - 1800000),
        type: 'text',
        status: 'sent'
      }
    ];

    const mockChat: Chat = {
      id: chatId,
      participant: {
        id: '2',
        name: 'Sarah Johnson',
        phone: '+1234567890',
        avatar: 'https://placehold.co/50x50?text=Profile+photo+of+Sarah+Johnson',
        isOnline: true
      },
      messages: mockMessages,
      isGroup: false
    };

    setChat(mockChat);

    // Simulate typing indicator
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Add a new message
        const newMessage: Message = {
          id: Date.now().toString(),
          content: 'Perfect! See you there 😊',
          senderId: '2',
          timestamp: new Date(),
          type: 'text',
          status: 'sent'
        };
        setChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages, newMessage]
        } : null);
      }, 2000);
    }, 3000);
  };

  const handleSendMessage = (content: string, type: 'text' | 'image' | 'file') => {
    if (!chat || !currentUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: currentUser.id,
      timestamp: new Date(),
      type,
      status: 'sending'
    };

    setChat(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage]
    } : null);

    // Simulate message status updates
    setTimeout(() => {
      setChat(prev => prev ? {
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      } : null);
    }, 1000);

    setTimeout(() => {
      setChat(prev => prev ? {
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      } : null);
    }, 2000);
  };

  if (!chat || !currentUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/')}
            className="md:hidden"
          >
            ←
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={chat.participant.avatar} />
            <AvatarFallback>
              {chat.participant.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">
              {chat.isGroup ? chat.groupName : chat.participant.name}
            </h3>
            <div className="flex items-center space-x-2">
              {chat.participant.isOnline && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  Online
                </Badge>
              )}
              {isTyping && (
                <span className="text-xs text-blue-600 animate-pulse">
                  typing...
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">📞</Button>
          <Button variant="ghost" size="sm">📹</Button>
          <Button variant="ghost" size="sm">ℹ️</Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-gray-50">
        <div className="space-y-4 max-w-4xl mx-auto">
          {chat.messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUser.id}
              showAvatar={
                index === 0 || 
                chat.messages[index - 1].senderId !== message.senderId
              }
              participant={chat.participant}
            />
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={chat.participant.avatar} />
                  <AvatarFallback>
                    {chat.participant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white px-4 py-2 rounded-2xl border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}