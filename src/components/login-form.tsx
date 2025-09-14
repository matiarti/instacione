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
import { useTranslations } from 'next-intl';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [authMethod, setAuthMethod] = useState<'magic' | 'password'>('password');
  const [isSignUp, setIsSignUp] = useState(false);

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

  // Google sign in temporarily disabled
  // const handleGoogleSignIn = async () => {
  //   setIsLoading(true);
  //   setMessage('');
  //   
  //   try {
  //     await signIn('google', {
  //       callbackUrl: '/'
  //     });
  //   } catch (error) {
  //     setMessage('Error signing in with Google. Please try again.');
  //     setMessageType('error');
  //     setIsLoading(false);
  //   }
  // };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to create account');
        setMessageType('error');
      } else {
        setMessage('Account created successfully! You can now sign in.');
        setMessageType('success');
        setIsSignUp(false);
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{isSignUp ? t('auth.signup.title') : t('auth.login.title')}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? t('auth.signup.description')
              : t('auth.login.description')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleCredentialsSignIn}>
            <div className="flex flex-col gap-6">
              {isSignUp && (
                <div className="grid gap-3">
                  <Label htmlFor="name">{t('auth.signup.fullName')}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('auth.signup.fullNamePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="grid gap-3">
                <Label htmlFor="email">{t('auth.login.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">{t('auth.login.password')}</Label>
                  {!isSignUp && (
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      {t('auth.login.forgotPassword')}
                    </a>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              {isSignUp && (
                <div className="grid gap-3">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading 
                    ? (isSignUp ? t('auth.signup.creatingAccount') : t('auth.login.signingIn')) 
                    : (isSignUp ? t('auth.signup.button') : t('auth.login.button'))
                  }
                </Button>
                {/* Google sign in temporarily disabled */}
                {/* {!isSignUp && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    Login with Google
                  </Button>
                )} */}
              </div>
            </div>
            
            {/* Magic link functionality temporarily disabled */}
            
            <div className="mt-4 text-center text-sm">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Sign up
                  </button>
                </>
              )}
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
