import { NextRequest, NextResponse } from 'next/server';

interface AuthRequest {
  phone: string;
  code?: string;
  name?: string;
  step: 'send_code' | 'verify_code' | 'complete_profile';
}

interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnline: boolean;
  createdAt: Date;
}

// In-memory storage for demo (use database in production)
const users: User[] = [];
const verificationCodes: Map<string, string> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body: AuthRequest = await request.json();
    const { phone, code, name, step } = body;

    switch (step) {
      case 'send_code':
        if (!phone) {
          return NextResponse.json(
            { error: 'Phone number is required' },
            { status: 400 }
          );
        }

        // Generate verification code (6 digits)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes.set(phone, verificationCode);

        // In production, send SMS here
        console.log(`Verification code for ${phone}: ${verificationCode}`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
          success: true,
          message: 'Verification code sent',
          // For demo purposes, return the code (don't do this in production!)
          debugCode: verificationCode
        });

      case 'verify_code':
        if (!phone || !code) {
          return NextResponse.json(
            { error: 'Phone number and verification code are required' },
            { status: 400 }
          );
        }

        const storedCode = verificationCodes.get(phone);
        if (!storedCode || storedCode !== code) {
          return NextResponse.json(
            { error: 'Invalid verification code' },
            { status: 400 }
          );
        }

        // Check if user already exists
        const existingUser = users.find(u => u.phone === phone);
        if (existingUser) {
          // Remove used verification code
          verificationCodes.delete(phone);
          
          return NextResponse.json({
            success: true,
            user: existingUser,
            isNewUser: false
          });
        }

        return NextResponse.json({
          success: true,
          isNewUser: true,
          message: 'Please complete your profile'
        });

      case 'complete_profile':
        if (!phone || !name) {
          return NextResponse.json(
            { error: 'Phone number and name are required' },
            { status: 400 }
          );
        }

        // Verify the phone was previously verified
        if (!verificationCodes.has(phone)) {
          return NextResponse.json(
            { error: 'Phone number not verified' },
            { status: 400 }
          );
        }

        // Create new user
        const newUser: User = {
          id: Math.random().toString(36).substring(7),
          name: name.trim(),
          phone,
          avatar: `https://placehold.co/80x80?text=${name.charAt(0)}+profile+avatar`,
          isOnline: true,
          createdAt: new Date()
        };

        users.push(newUser);
        verificationCodes.delete(phone);

        return NextResponse.json({
          success: true,
          user: newUser,
          isNewUser: true
        });

      default:
        return NextResponse.json(
          { error: 'Invalid step' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    totalUsers: users.length,
    onlineUsers: users.filter(u => u.isOnline).length
  });
}