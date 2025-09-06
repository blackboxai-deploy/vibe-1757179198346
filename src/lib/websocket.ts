'use client';

interface WebSocketMessage {
  type: 'message' | 'typing' | 'status' | 'presence';
  data: any;
  chatId?: string;
  userId?: string;
  timestamp: Date;
}



class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: WebSocketMessage[] = [];
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  private connect() {
    try {
      // In a real app, this would be your WebSocket server URL
      const wsUrl = typeof window !== 'undefined' && window.location.protocol === 'https:' 
        ? 'wss://your-domain.com/ws' 
        : 'ws://localhost:3001/ws';

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.flushMessageQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleIncomingMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  private handleIncomingMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type) || [];
    listeners.forEach(listener => {
      try {
        listener(message.data);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });
  }

  public sendMessage(message: Omit<WebSocketMessage, 'timestamp'>) {
    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: new Date()
    };

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Queue message for when connection is restored
      this.messageQueue.push(fullMessage);
      return;
    }

    try {
      this.ws.send(JSON.stringify(fullMessage));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      this.messageQueue.push(fullMessage);
    }
  }

  public sendChatMessage(chatId: string, content: string, senderId: string) {
    this.sendMessage({
      type: 'message',
      chatId,
      userId: senderId,
      data: {
        content,
        type: 'text'
      }
    });
  }

  public sendTypingIndicator(chatId: string, userId: string, isTyping: boolean) {
    this.sendMessage({
      type: 'typing',
      chatId,
      userId,
      data: { isTyping }
    });
  }

  public updatePresence(userId: string, isOnline: boolean) {
    this.sendMessage({
      type: 'presence',
      userId,
      data: { isOnline, lastSeen: isOnline ? undefined : new Date() }
    });
  }

  public subscribe(eventType: string, listener: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      default:
        return 'disconnected';
    }
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
  if (!wsManager && typeof window !== 'undefined') {
    wsManager = new WebSocketManager();
  }
  return wsManager!;
}

// React hook for WebSocket functionality
export function useWebSocket() {
  const ws = getWebSocketManager();

  const sendMessage = (chatId: string, content: string, senderId: string) => {
    ws.sendChatMessage(chatId, content, senderId);
  };

  const sendTyping = (chatId: string, userId: string, isTyping: boolean) => {
    ws.sendTypingIndicator(chatId, userId, isTyping);
  };

  const updatePresence = (userId: string, isOnline: boolean) => {
    ws.updatePresence(userId, isOnline);
  };

  const subscribe = (eventType: string, listener: Function) => {
    return ws.subscribe(eventType, listener);
  };

  const getStatus = () => ws.getConnectionStatus();

  return {
    sendMessage,
    sendTyping,
    updatePresence,
    subscribe,
    getStatus
  };
}