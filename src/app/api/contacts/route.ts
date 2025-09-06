import { NextRequest, NextResponse } from 'next/server';

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  isBlocked: boolean;
  addedAt: Date;
}

interface AddContactRequest {
  phone: string;
  name?: string;
  userId: string;
}

interface UpdateContactRequest {
  contactId: string;
  name?: string;
  isBlocked?: boolean;
}

// In-memory storage for demo (use database in production)
const contacts: Contact[] = [];
const userContacts: Map<string, string[]> = new Map(); // userId -> contactIds[]

// Mock some initial contacts
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    phone: '+1234567890',
    avatar: 'https://placehold.co/50x50?text=Profile+photo+of+Sarah+Johnson',
    isOnline: true,
    isBlocked: false,
    addedAt: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    id: '2',
    name: 'Mike Chen',
    phone: '+1987654321',
    avatar: 'https://placehold.co/50x50?text=Profile+photo+of+Mike+Chen',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
    isBlocked: false,
    addedAt: new Date(Date.now() - 172800000) // 2 days ago
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    phone: '+1555123456',
    avatar: 'https://placehold.co/50x50?text=Profile+photo+of+Emily+Rodriguez',
    isOnline: true,
    isBlocked: false,
    addedAt: new Date(Date.now() - 259200000) // 3 days ago
  },
  {
    id: '4',
    name: 'David Wilson',
    phone: '+1777888999',
    avatar: 'https://placehold.co/50x50?text=Profile+photo+of+David+Wilson',
    isOnline: false,
    lastSeen: new Date(Date.now() - 7200000), // 2 hours ago
    isBlocked: false,
    addedAt: new Date(Date.now() - 432000000) // 5 days ago
  }
];

// Initialize with mock data
contacts.push(...mockContacts);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle adding a new contact
    if (body.phone) {
      const { phone, name, userId }: AddContactRequest = body;

      if (!phone || !userId) {
        return NextResponse.json(
          { error: 'Phone number and user ID are required' },
          { status: 400 }
        );
      }

      // Check if contact already exists
      const existingContact = contacts.find(c => c.phone === phone);
      
      if (existingContact) {
        // Check if user already has this contact
        const userContactList = userContacts.get(userId) || [];
        if (userContactList.includes(existingContact.id)) {
          return NextResponse.json(
            { error: 'Contact already exists' },
            { status: 409 }
          );
        }
        
        // Add existing contact to user's list
        userContactList.push(existingContact.id);
        userContacts.set(userId, userContactList);
        
        return NextResponse.json({
          success: true,
          contact: existingContact,
          message: 'Contact added to your list'
        });
      }

      // Create new contact
      const newContact: Contact = {
        id: Math.random().toString(36).substring(7),
        name: name || phone,
        phone,
        avatar: name ? `https://placehold.co/50x50?text=${name.charAt(0)}+profile+avatar` : undefined,
        isOnline: false,
        isBlocked: false,
        addedAt: new Date()
      };

      contacts.push(newContact);
      
      // Add to user's contact list
      const userContactList = userContacts.get(userId) || [];
      userContactList.push(newContact.id);
      userContacts.set(userId, userContactList);

      return NextResponse.json({
        success: true,
        contact: newContact,
        message: 'New contact added'
      });
    }

    // Handle updating contact
    if (body.contactId) {
      const { contactId, name, isBlocked }: UpdateContactRequest = body;

      const contactIndex = contacts.findIndex(c => c.id === contactId);
      if (contactIndex === -1) {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }

      if (name !== undefined) {
        contacts[contactIndex].name = name;
      }
      
      if (isBlocked !== undefined) {
        contacts[contactIndex].isBlocked = isBlocked;
      }

      return NextResponse.json({
        success: true,
        contact: contacts[contactIndex],
        message: 'Contact updated'
      });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Contacts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const showBlocked = searchParams.get('showBlocked') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's contacts
    const userContactIds = userContacts.get(userId) || [];
    let userContacts_filtered = contacts.filter(c => userContactIds.includes(c.id));

    // Filter blocked contacts
    if (!showBlocked) {
      userContacts_filtered = userContacts_filtered.filter(c => !c.isBlocked);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      userContacts_filtered = userContacts_filtered.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.phone.includes(search)
      );
    }

    // Sort by name
    userContacts_filtered.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      contacts: userContacts_filtered,
      total: userContacts_filtered.length,
      online: userContacts_filtered.filter(c => c.isOnline).length
    });

  } catch (error) {
    console.error('Get contacts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const userId = searchParams.get('userId');

    if (!contactId || !userId) {
      return NextResponse.json(
        { error: 'Contact ID and User ID are required' },
        { status: 400 }
      );
    }

    // Remove contact from user's list
    const userContactList = userContacts.get(userId) || [];
    const updatedList = userContactList.filter(id => id !== contactId);
    userContacts.set(userId, updatedList);

    return NextResponse.json({
      success: true,
      message: 'Contact removed from your list'
    });

  } catch (error) {
    console.error('Delete contact API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}