import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import CreateBug from '../CreateBug';
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
const mockUsers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  {
    _id: '2',
    name: 'Jane Doe',
    email: 'jane@example.com',
  },
];

const mockBug = {
  _id: '1',
  title: 'Test Bug',
  description: 'Test Description',
  status: 'open',
  priority: 'high',
  assignedTo: '1',
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

describe('CreateBug Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock localStorage
    localStorage.getItem.mockReturnValue('mock-token');
    
    // Mock axios get request for users
    axios.get.mockResolvedValue({ data: mockUsers });
  });

  it('renders loading state initially', () => {
    renderWithProviders(<CreateBug />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders form after loading users', async () => {
    renderWithProviders(<CreateBug />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Priority')).toBeInTheDocument();
      expect(screen.getByLabelText('Assign To')).toBeInTheDocument();
    });
  });

  it('renders error message when fetching users fails', async () => {
    axios.get.mockRejectedValue(new Error('Failed to fetch users'));
    
    renderWithProviders(<CreateBug />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    renderWithProviders(<CreateBug />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Create Bug'));

    // Check for validation messages
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Status is required')).toBeInTheDocument();
    expect(screen.getByText('Priority is required')).toBeInTheDocument();
  });

  it('creates bug successfully', async () => {
    axios.post.mockResolvedValue({ data: mockBug });
    
    renderWithProviders(<CreateBug />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Bug' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test Description' },
    });
    
    // Select status
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusSelect);
    fireEvent.click(screen.getByText('Open'));
    
    // Select priority
    const prioritySelect = screen.getByLabelText('Priority');
    fireEvent.mouseDown(prioritySelect);
    fireEvent.click(screen.getByText('High'));
    
    // Select assignee
    const assigneeSelect = screen.getByLabelText('Assign To');
    fireEvent.mouseDown(assigneeSelect);
    fireEvent.click(screen.getByText('John Doe'));

    // Submit the form
    fireEvent.click(screen.getByText('Create Bug'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/bugs'),
        expect.objectContaining({
          title: 'Test Bug',
          description: 'Test Description',
          status: 'open',
          priority: 'high',
          assignedTo: '1',
        }),
        expect.any(Object)
      );
      expect(mockNavigate).toHaveBeenCalledWith('/bugs');
    });
  });

  it('handles create bug error gracefully', async () => {
    axios.post.mockRejectedValue(new Error('Failed to create bug'));
    
    renderWithProviders(<CreateBug />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Bug' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test Description' },
    });
    
    // Select status
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusSelect);
    fireEvent.click(screen.getByText('Open'));
    
    // Select priority
    const prioritySelect = screen.getByLabelText('Priority');
    fireEvent.mouseDown(prioritySelect);
    fireEvent.click(screen.getByText('High'));

    // Submit the form
    fireEvent.click(screen.getByText('Create Bug'));

    await waitFor(() => {
      expect(screen.getByText('Failed to create bug')).toBeInTheDocument();
    });
  });

  it('navigates back to bug list when cancel is clicked', async () => {
    renderWithProviders(<CreateBug />);
    
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockNavigate).toHaveBeenCalledWith('/bugs');
  });
}); 