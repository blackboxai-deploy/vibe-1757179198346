'use client';

interface StorageOptions {
  encrypt?: boolean;
  expiry?: number; // milliseconds
}

interface StoredItem {
  value: any;
  timestamp: number;
  expiry?: number;
}

class LocalStorageManager {
  private prefix = 'messenger_';

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private isExpired(item: StoredItem): boolean {
    if (!item.expiry) return false;
    return Date.now() > item.timestamp + item.expiry;
  }

  public set(key: string, value: any, options: StorageOptions = {}): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const item: StoredItem = {
        value,
        timestamp: Date.now(),
        expiry: options.expiry
      };

      const serializedItem = JSON.stringify(item);
      window.localStorage.setItem(this.getKey(key), serializedItem);
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  public get<T>(key: string, defaultValue?: T): T | null {
    if (typeof window === 'undefined') return defaultValue || null;

    try {
      const serializedItem = window.localStorage.getItem(this.getKey(key));
      if (!serializedItem) return defaultValue || null;

      const item: StoredItem = JSON.parse(serializedItem);
      
      if (this.isExpired(item)) {
        this.remove(key);
        return defaultValue || null;
      }

      return item.value;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue || null;
    }
  }

  public remove(key: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      window.localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  }

  public clear(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const keys = Object.keys(window.localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          window.localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  public exists(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(this.getKey(key)) !== null;
  }

  public size(): number {
    if (typeof window === 'undefined') return 0;

    const keys = Object.keys(window.localStorage);
    return keys.filter(key => key.startsWith(this.prefix)).length;
  }
}

// Chat-specific storage utilities
export class ChatStorage {
  private storage = new LocalStorageManager();

  // User data
  public saveUser(user: any): boolean {
    return this.storage.set('current_user', user);
  }

  public getUser(): any | null {
    return this.storage.get('current_user');
  }

  public clearUser(): boolean {
    return this.storage.remove('current_user');
  }

  // Chat messages (with expiry)
  public saveMessages(chatId: string, messages: any[]): boolean {
    return this.storage.set(`messages_${chatId}`, messages, {
      expiry: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  public getMessages(chatId: string): any[] {
    return this.storage.get(`messages_${chatId}`, []) || [];
  }

  public addMessage(chatId: string, message: any): boolean {
    const messages = this.getMessages(chatId);
    messages.push(message);
    return this.saveMessages(chatId, messages);
  }

  public clearMessages(chatId: string): boolean {
    return this.storage.remove(`messages_${chatId}`);
  }

  // Chat list
  public saveChats(chats: any[]): boolean {
    return this.storage.set('chat_list', chats, {
      expiry: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  public getChats(): any[] {
    return this.storage.get('chat_list', []) || [];
  }

  // Contacts
  public saveContacts(contacts: any[]): boolean {
    return this.storage.set('contacts', contacts, {
      expiry: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  public getContacts(): any[] {
    return this.storage.get('contacts', []) || [];
  }

  // App settings
  public saveSetting(key: string, value: any): boolean {
    const settings = this.storage.get('app_settings', {}) || {};
    settings[key] = value;
    return this.storage.set('app_settings', settings);
  }

  public getSetting(key: string, defaultValue?: any): any {
    const settings = this.storage.get('app_settings', {}) || {};
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }

  // Draft messages
  public saveDraft(chatId: string, content: string): boolean {
    if (!content.trim()) {
      return this.storage.remove(`draft_${chatId}`);
    }
    return this.storage.set(`draft_${chatId}`, content, {
      expiry: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  public getDraft(chatId: string): string {
    return this.storage.get(`draft_${chatId}`, '') || '';
  }

  public clearDraft(chatId: string): boolean {
    return this.storage.remove(`draft_${chatId}`);
  }

  // Clear all chat data
  public clearAll(): boolean {
    return this.storage.clear();
  }

  // Get storage info
  public getStorageInfo(): { size: number; keys: string[] } {
    const size = this.storage.size();
    const keys: string[] = [];
    
    if (typeof window !== 'undefined') {
      Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith('messenger_')) {
          keys.push(key.replace('messenger_', ''));
        }
      });
    }

    return { size, keys };
  }
}

// Singleton instance
export const chatStorage = new ChatStorage();

// React hook for storage functionality
export function useStorage() {
  const storage = chatStorage;

  const saveUser = (user: any) => storage.saveUser(user);
  const getUser = () => storage.getUser();
  const clearUser = () => storage.clearUser();

  const saveMessages = (chatId: string, messages: any[]) => 
    storage.saveMessages(chatId, messages);
  const getMessages = (chatId: string) => storage.getMessages(chatId);
  const addMessage = (chatId: string, message: any) => 
    storage.addMessage(chatId, message);

  const saveDraft = (chatId: string, content: string) => 
    storage.saveDraft(chatId, content);
  const getDraft = (chatId: string) => storage.getDraft(chatId);
  const clearDraft = (chatId: string) => storage.clearDraft(chatId);

  const saveSetting = (key: string, value: any) => 
    storage.saveSetting(key, value);
  const getSetting = (key: string, defaultValue?: any) => 
    storage.getSetting(key, defaultValue);

  return {
    saveUser,
    getUser,
    clearUser,
    saveMessages,
    getMessages,
    addMessage,
    saveDraft,
    getDraft,
    clearDraft,
    saveSetting,
    getSetting,
    clearAll: () => storage.clearAll(),
    getStorageInfo: () => storage.getStorageInfo()
  };
}