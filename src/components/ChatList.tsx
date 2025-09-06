'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
}

export default function ChatList({ chats, selectedChat, onSelectChat }: ChatListProps) {
  return (
    <div className="divide-y divide-gray-100">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onSelectChat(chat)}
          className={cn(
            "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
            selectedChat?.id === chat.id && "bg-blue-50 border-r-2 border-blue-500"
          )}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.participant.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                  {chat.participant.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {chat.participant.isOnline && !chat.isGroup && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              )}
              {chat.isGroup && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-400 border-2 border-white rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {chat.groupMembers?.length || 0}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 truncate">
                  {chat.isGroup ? chat.groupName : chat.participant.name}
                </h4>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {chat.lastMessageTime}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600 truncate pr-2">
                  {chat.lastMessage}
                </p>
                {chat.unreadCount > 0 && (
                  <Badge 
                    variant="default" 
                    className="bg-blue-500 hover:bg-blue-600 text-white min-w-[20px] h-5 text-xs flex items-center justify-center"
                  >
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </Badge>
                )}
              </div>
              
              {chat.isGroup && chat.groupMembers && (
                <div className="flex items-center mt-2 space-x-1">
                  <span className="text-xs text-gray-400">Members:</span>
                  <div className="flex -space-x-1">
                    {chat.groupMembers.slice(0, 3).map((member) => (
                      <Avatar key={member.id} className="h-4 w-4 border border-white">
                        <AvatarFallback className="text-xs bg-gray-300">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {chat.groupMembers.length > 3 && (
                      <div className="h-4 w-4 bg-gray-200 rounded-full border border-white flex items-center justify-center">
                        <span className="text-xs text-gray-600">
                          +{chat.groupMembers.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {chats.length === 0 && (
        <div className="p-8 text-center">
          <img 
            src="https://placehold.co/150x100?text=No+conversations+yet+illustration" 
            alt="No conversations yet illustration"
            className="mx-auto mb-4 opacity-50"
          />
          <h3 className="font-semibold text-gray-600 mb-2">No conversations yet</h3>
          <p className="text-sm text-gray-500">
            Start chatting by adding a new contact
          </p>
        </div>
      )}
    </div>
  );
}