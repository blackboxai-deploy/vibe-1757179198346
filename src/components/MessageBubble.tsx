'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  participant: User;
}

export function MessageBubble({ message, isOwn, showAvatar, participant }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return '⏳';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '💙';
      default:
        return '';
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <img 
              src="https://placehold.co/300x200?text=Shared+image+placeholder" 
              alt="Shared image placeholder"
              className="rounded-lg max-w-xs"
            />
            <p className="text-sm">{message.content}</p>
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
            <div className="text-2xl">📄</div>
            <div>
              <p className="font-medium text-sm">{message.content}</p>
              <p className="text-xs text-gray-500">Document</p>
            </div>
          </div>
        );
      default:
        return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
  };

  return (
    <div className={cn(
      "flex items-end space-x-2",
      isOwn ? "justify-end" : "justify-start"
    )}>
      {/* Avatar for received messages */}
      {!isOwn && showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={participant.avatar} />
          <AvatarFallback className="text-xs">
            {participant.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Spacer when avatar is not shown */}
      {!isOwn && !showAvatar && (
        <div className="w-8 flex-shrink-0" />
      )}

      {/* Message bubble */}
      <div className={cn(
        "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative",
        isOwn 
          ? "bg-blue-500 text-white rounded-br-sm" 
          : "bg-white border rounded-bl-sm",
        message.type === 'image' && "p-2"
      )}>
        {renderMessageContent()}
        
        {/* Message metadata */}
        <div className={cn(
          "flex items-center justify-end space-x-1 mt-1",
          isOwn ? "text-blue-100" : "text-gray-500"
        )}>
          <span className="text-xs">
            {formatTime(message.timestamp)}
          </span>
          {isOwn && (
            <span className="text-xs">
              {getStatusIcon(message.status)}
            </span>
          )}
        </div>
      </div>

      {/* Avatar spacer for sent messages */}
      {isOwn && (
        <div className="w-8 flex-shrink-0" />
      )}
    </div>
  );
}