'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [authMethod, setAuthMethod] = useState<'magic' | 'password'>('magic');

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/'
      });

      if (result?.error) {
        setMessage('Error sending magic link. Please try again.');
        setMessageType('error');
      } else {
        setMessage('Check your email for the magic link!');
        setMessageType('success');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/'
      });

      if (result?.error) {
        setMessage('Invalid email or password.');
        setMessageType('error');
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      await signIn('google', {
        callbackUrl: '/'
      });
    } catch (error) {
      setMessage('Error signing in with Google. Please try again.');
      setMessageType('error');
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            {authMethod === 'magic' 
              ? 'Enter your email below to receive a magic link'
              : 'Enter your email and password to login to your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={authMethod === 'magic' ? handleMagicLinkSignIn : handleCredentialsSignIn}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              {authMethod === 'password' && (
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading 
                    ? (authMethod === 'magic' ? 'Sending...' : 'Signing in...') 
                    : (authMethod === 'magic' ? 'Send Magic Link' : 'Login')
                  }
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  Login with Google
                </Button>
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm">
              {authMethod === 'magic' ? (
                <>
                  Prefer to use a password?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMethod('password')}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign in with password
                  </button>
                </>
              ) : (
                <>
                  Prefer a magic link?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMethod('magic')}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Send magic link
                  </button>
                </>
              )}
            </div>
            
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4 hover:text-primary">
                Sign up
              </a>
            </div>
          </form>
          
          {message && (
            <div className={`mt-4 text-sm text-center ${
              messageType === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
