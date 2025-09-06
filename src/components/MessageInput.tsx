'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSendMessage: (message: string, type: 'text' | 'image' | 'file') => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (value: string) => {
    setMessage(value);
    setIsTyping(value.length > 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, just send the filename as a message
      // In a real app, you'd upload the file first
      onSendMessage(`📎 ${file.name}`, type);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {/* Typing indicator space */}
      <div className="mb-2 h-4">
        {isTyping && (
          <p className="text-xs text-gray-500 animate-pulse">
            You are typing...
          </p>
        )}
      </div>

      {/* Input area */}
      <div className="flex items-end space-x-2">
        {/* Attachment buttons */}
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0"
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled}
          >
            📷
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            📎
          </Button>
        </div>

        {/* Message input */}
        <div className="flex-1">
          {message.length > 100 ? (
            <Textarea
              placeholder="Type a message..."
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="resize-none min-h-[40px] max-h-32"
              rows={1}
            />
          ) : (
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="flex-1"
            />
          )}
        </div>

        {/* Send button */}
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled}
          size="sm"
          className="h-10 w-10 p-0 rounded-full"
        >
          ✈️
        </Button>
      </div>

      {/* AI Suggestions */}
      <div className="mt-2 flex flex-wrap gap-1">
        {!message && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6"
              onClick={() => handleInputChange('Hello! How are you?')}
              disabled={disabled}
            >
              👋 Hello
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6"
              onClick={() => handleInputChange('Thanks!')}
              disabled={disabled}
            >
              🙏 Thanks
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6"
              onClick={() => handleInputChange('See you later!')}
              disabled={disabled}
            >
              👋 Goodbye
            </Button>
          </>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'image')}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'file')}
      />

      {/* Voice message button (for future implementation) */}
      <div className="mt-2 text-center">
        <Button variant="ghost" size="sm" className="text-xs" disabled>
          🎤 Hold to record voice message
        </Button>
      </div>
    </div>
  );
}