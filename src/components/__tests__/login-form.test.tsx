import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { LoginForm } from '../login-form'

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn()
}))

// Mock fetch
global.fetch = vi.fn()

// Mock translations
const mockMessages = {
  auth: {
    login: {
      title: 'Login to your account',
      description: 'Enter your credentials to access your account',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      button: 'Login',
      signingIn: 'Signing in...'
    },
    signup: {
      title: 'Create your account',
      description: 'Enter your information to create an account',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter your full name',
      button: 'Create Account',
      creatingAccount: 'Creating account...'
    }
  }
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={mockMessages}>
    {children}
  </NextIntlClientProvider>
)

describe('LoginForm', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockClear()
  })

  it('should render login form by default', () => {
    render(<TestWrapper><LoginForm /></TestWrapper>)
    
    expect(screen.getByText('Login to your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
  })

  it('should switch to sign up mode when clicking sign up link', async () => {
    render(<TestWrapper><LoginForm /></TestWrapper>)
    
    const signUpLink = screen.getByText('Sign up')
    await user.click(signUpLink)
    
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone Number (Optional)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
    expect(screen.getByText('Already have an account?')).toBeInTheDocument()
  })

  it('should switch back to login mode when clicking sign in link', async () => {
    render(<TestWrapper><LoginForm /></TestWrapper>)
    
    // Switch to sign up mode
    const signUpLink = screen.getByText('Sign up')
    await user.click(signUpLink)
    
    // Switch back to login mode
    const signInLink = screen.getByText('Sign in')
    await user.click(signInLink)
    
    expect(screen.getByText('Login to your account')).toBeInTheDocument()
    expect(screen.queryByLabelText('Full Name')).not.toBeInTheDocument()
  })

  it('should handle successful sign up', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'User created successfully! You can now sign in.',
        user: {
          id: 'user_123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'DRIVER'
        }
      })
    })

    render(<TestWrapper><LoginForm /></TestWrapper>)
    
    // Switch to sign up mode
    const signUpLink = screen.getByText('Sign up')
    await user.click(signUpLink)
    
    // Fill out the form
    await user.type(screen.getByLabelText('Full Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Phone Number (Optional)'), '+1234567890')
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          phone: '+1234567890',
        }),
      })
    })
    
    await waitFor(() => {
      expect(screen.getByText('Account created successfully! You can now sign in.')).toBeInTheDocument()
    })
    
    // Should switch back to login mode
    expect(screen.getByText('Login to your account')).toBeInTheDocument()
  })

  it('should handle sign up error', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'User with this email already exists'
      })
    })

    render(<TestWrapper><LoginForm /></TestWrapper>)
    
    // Switch to sign up mode
    const signUpLink = screen.getByText('Sign up')
    await user.click(signUpLink)
    
    // Fill out the form
    await user.type(screen.getByLabelText('Full Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('User with this email already exists')).toBeInTheDocument()
    })
  })

  it('should handle successful login', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ error: null })
    const { signIn } = await import('next-auth/react')
    ;(signIn as any).mockImplementation(mockSignIn)

    render(<TestWrapper><LoginForm /></TestWrapper>)
    
    // Fill out the form
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Login' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
        callbackUrl: '/'
      })
    })
  })

  it('should handle login error', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ error: 'Invalid credentials' })
    const { signIn } = await import('next-auth/react')
    ;(signIn as any).mockImplementation(mockSignIn)

    render(<TestWrapper><LoginForm /></TestWrapper>)
    
    // Fill out the form
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Login' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password.')).toBeInTheDocument()
    })
  })

  it('should show loading state during sign up', async () => {
    ;(global.fetch as any).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, message: 'Success' })
      }), 100))
    )

    render(<TestWrapper><LoginForm /></TestWrapper>)
    
    // Switch to sign up mode
    const signUpLink = screen.getByText('Sign up')
    await user.click(signUpLink)
    
    // Fill out the form
    await user.type(screen.getByLabelText('Full Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    await user.click(submitButton)
    
    // Should show loading state
    expect(screen.getByText('Creating account...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('should show loading state during login', async () => {
    const mockSignIn = vi.fn().mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    )
    const { signIn } = await import('next-auth/react')
    ;(signIn as any).mockImplementation(mockSignIn)

    render(<TestWrapper><LoginForm /></TestWrapper>)
    
    // Fill out the form
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Login' })
    await user.click(submitButton)
    
    // Should show loading state
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('should validate required fields in sign up form', async () => {
    render(<TestWrapper><LoginForm /></TestWrapper>)
    
    // Switch to sign up mode
    const signUpLink = screen.getByText('Sign up')
    await user.click(signUpLink)
    
    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    await user.click(submitButton)
    
    // HTML5 validation should prevent submission
    const nameInput = screen.getByLabelText('Full Name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    
    expect(nameInput).toBeRequired()
    expect(emailInput).toBeRequired()
    expect(passwordInput).toBeRequired()
  })

  it('should clear form fields after successful sign up', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'User created successfully! You can now sign in.',
        user: { id: 'user_123', name: 'Test User', email: 'test@example.com', role: 'DRIVER' }
      })
    })

    render(<TestWrapper><LoginForm /></TestWrapper>)
    
    // Switch to sign up mode
    const signUpLink = screen.getByText('Sign up')
    await user.click(signUpLink)
    
    // Fill out the form
    await user.type(screen.getByLabelText('Full Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Phone Number (Optional)'), '+1234567890')
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create Account' })
    await user.click(submitButton)
    
    await waitFor(() => {
      // Should be back in login mode
      expect(screen.getByText('Login to your account')).toBeInTheDocument()
    })
    
    // Fields should be cleared
    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(screen.getByLabelText('Password')).toHaveValue('')
  })
})
