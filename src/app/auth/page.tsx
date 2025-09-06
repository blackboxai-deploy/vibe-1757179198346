'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  isOnline: boolean;
}

export default function AuthPage() {
  const [step, setStep] = useState<'phone' | 'verification' | 'profile'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('verification');
    }, 1500);
  };

  const handleVerificationSubmit = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Check if user exists (mock check)
      const userExists = Math.random() > 0.5; // 50% chance user exists
      if (userExists) {
        // Existing user - redirect to home
        const mockUser: User = {
          id: '1',
          name: 'John Doe',
          phone: phoneNumber,
          avatar: 'https://placehold.co/80x80?text=User+profile+avatar+photo',
          isOnline: true
        };
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        router.push('/');
      } else {
        // New user - go to profile setup
        setStep('profile');
      }
    }, 1500);
  };

  const handleProfileSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      const newUser: User = {
        id: Math.random().toString(36).substring(7),
        name: name.trim(),
        phone: phoneNumber,
        avatar: `https://placehold.co/80x80?text=${name.charAt(0)}+profile+avatar`,
        isOnline: true
      };
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      router.push('/');
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Mobile Messenger
          </CardTitle>
          <div className="flex justify-center space-x-2 mt-4">
            <Badge variant={step === 'phone' ? 'default' : 'secondary'}>1</Badge>
            <Badge variant={step === 'verification' ? 'default' : 'secondary'}>2</Badge>
            <Badge variant={step === 'profile' ? 'default' : 'secondary'}>3</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'phone' && (
            <>
              <div className="text-center mb-6">
                <img 
                  src="https://placehold.co/200x150?text=Phone+verification+security+illustration" 
                  alt="Phone verification security illustration"
                  className="mx-auto mb-4 rounded-lg"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Enter your phone number
                </h3>
                <p className="text-gray-600 text-sm">
                  We'll send you a verification code to confirm your number
                </p>
              </div>
              
              <div className="space-y-4">
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handlePhoneSubmit)}
                  disabled={isLoading}
                  className="text-center text-lg"
                />
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  onClick={handlePhoneSubmit}
                  disabled={isLoading || !phoneNumber.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
                
                <p className="text-xs text-center text-gray-500">
                  Standard messaging rates may apply
                </p>
              </div>
            </>
          )}

          {step === 'verification' && (
            <>
              <div className="text-center mb-6">
                <img 
                  src="https://placehold.co/200x150?text=SMS+verification+code+illustration" 
                  alt="SMS verification code illustration"
                  className="mx-auto mb-4 rounded-lg"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Enter verification code
                </h3>
                <p className="text-gray-600 text-sm">
                  We sent a 6-digit code to {phoneNumber}
                </p>
              </div>
              
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => handleKeyDown(e, handleVerificationSubmit)}
                  disabled={isLoading}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  onClick={handleVerificationSubmit}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
                
                <div className="flex justify-between text-sm">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setStep('phone')}
                    disabled={isLoading}
                  >
                    ← Change number
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={isLoading}
                  >
                    Resend code
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 'profile' && (
            <>
              <div className="text-center mb-6">
                <img 
                  src="https://placehold.co/200x150?text=User+profile+setup+welcome+illustration" 
                  alt="User profile setup welcome illustration"
                  className="mx-auto mb-4 rounded-lg"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Complete your profile
                </h3>
                <p className="text-gray-600 text-sm">
                  Tell us your name so your friends can find you
                </p>
              </div>
              
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleProfileSubmit)}
                  disabled={isLoading}
                  className="text-center"
                />
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  onClick={handleProfileSubmit}
                  disabled={isLoading || !name.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setStep('verification')}
                  disabled={isLoading}
                  className="w-full"
                >
                  ← Back
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}