import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from '../Login';
import { AuthProvider } from '../../context/AuthContext';

// Mock axios
vi.mock('axios');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock data
const mockUser = {
  _id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  token: 'mock-token',
};

// Wrapper component for testing
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithProviders(<Login />);
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Check for validation messages
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    renderWithProviders(<Login />);
    
    // Fill in invalid email
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Check for validation message
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('logs in successfully', async () => {
    axios.post.mockResolvedValue({ data: mockUser });
    
    renderWithProviders(<Login />);
    
    // Fill in the form
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/login'),
        {
          email: 'test@example.com',
          password: 'password123',
        }
      );
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockUser.token);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles login error gracefully', async () => {
    axios.post.mockRejectedValue(new Error('Invalid credentials'));
    
    renderWithProviders(<Login />);
    
    // Fill in the form
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('navigates to register page when register link is clicked', () => {
    renderWithProviders(<Login />);
    
    const registerLink = screen.getByRole('link', { name: /register/i });
    fireEvent.click(registerLink);
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('shows loading state during login', async () => {
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderWithProviders(<Login />);
    
    // Fill in the form
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Check for loading state
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/logging in/i)).not.toBeInTheDocument();
    });
  });
}); 