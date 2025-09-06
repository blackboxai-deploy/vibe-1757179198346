import { NextRequest, NextResponse } from 'next/server';

interface Message {
  id: string;
  chatId: string;
  content: string;
  senderId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface SendMessageRequest {
  chatId: string;
  content: string;
  senderId: string;
  type: 'text' | 'image' | 'file';
}

interface AIMessageRequest {
  content: string;
  action: 'suggest' | 'translate' | 'summarize';
  targetLanguage?: string;
}

// In-memory storage for demo (use database in production)
const messages: Message[] = [];

// AI Integration using OpenRouter
async function callAI(prompt: string) {
  try {
    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'customerId': 'gstar3392@gmail.com',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx'
      },
      body: JSON.stringify({
        model: 'openrouter/anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not process that.';
  } catch (error) {
    console.error('AI API error:', error);
    return 'AI service is currently unavailable.';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle AI-powered features
    if (body.action) {
      const { content, action, targetLanguage }: AIMessageRequest = body;
      
      let prompt = '';
      switch (action) {
        case 'suggest':
          prompt = `Generate 3 short, friendly message suggestions in response to: "${content}". Return only the suggestions, one per line, without numbering or quotes.`;
          break;
        case 'translate':
          prompt = `Translate this message to ${targetLanguage || 'Spanish'}: "${content}". Return only the translation.`;
          break;
        case 'summarize':
          prompt = `Summarize this conversation in 1-2 sentences: "${content}"`;
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid AI action' },
            { status: 400 }
          );
      }

      const aiResponse = await callAI(prompt);
      
      return NextResponse.json({
        success: true,
        result: aiResponse,
        action
      });
    }

    // Handle sending messages
    const { chatId, content, senderId, type }: SendMessageRequest = body;

    if (!chatId || !content || !senderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      chatId,
      content,
      senderId,
      timestamp: new Date(),
      type: type || 'text',
      status: 'sent'
    };

    messages.push(newMessage);

    // Simulate message delivery status updates
    setTimeout(() => {
      const messageIndex = messages.findIndex(m => m.id === newMessage.id);
      if (messageIndex !== -1) {
        messages[messageIndex].status = 'delivered';
      }
    }, 1000);

    setTimeout(() => {
      const messageIndex = messages.findIndex(m => m.id === newMessage.id);
      if (messageIndex !== -1) {
        messages[messageIndex].status = 'read';
      }
    }, 3000);

    return NextResponse.json({
      success: true,
      message: newMessage
    });

  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    const chatMessages = messages
      .filter(m => m.chatId === chatId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      messages: chatMessages,
      total: messages.filter(m => m.chatId === chatId).length
    });

  } catch (error) {
    console.error('Get messages API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// WebSocket functionality would be implemented separately
// For now, we'll use polling or Server-Sent Events for real-time updates