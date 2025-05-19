import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import BugList from '../BugList';
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
const mockBugs = [
  {
    _id: '1',
    title: 'Test Bug 1',
    description: 'Test Description 1',
    status: 'open',
    priority: 'high',
    assignedTo: { _id: '1', name: 'John Doe' },
    createdBy: { _id: '1', name: 'Admin' },
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: '2',
    title: 'Test Bug 2',
    description: 'Test Description 2',
    status: 'in-progress',
    priority: 'medium',
    assignedTo: { _id: '2', name: 'Jane Doe' },
    createdBy: { _id: '2', name: 'User' },
    createdAt: '2024-01-02T00:00:00.000Z',
  },
];

const mockUser = {
  _id: '1',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
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

describe('BugList Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock localStorage
    localStorage.getItem.mockReturnValue('mock-token');
    
    // Mock axios get request
    axios.get.mockResolvedValue({ data: mockBugs });
  });

  it('renders loading state initially', () => {
    renderWithProviders(<BugList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders bug list after successful fetch', async () => {
    renderWithProviders(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
      expect(screen.getByText('Test Bug 2')).toBeInTheDocument();
    });
  });

  it('renders error message when fetch fails', async () => {
    axios.get.mockRejectedValue(new Error('Failed to fetch'));
    
    renderWithProviders(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch bugs')).toBeInTheDocument();
    });
  });

  it('filters bugs by search input', async () => {
    renderWithProviders(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
      expect(screen.getByText('Test Bug 2')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'Bug 1' } });

    expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Bug 2')).not.toBeInTheDocument();
  });

  it('filters bugs by status', async () => {
    renderWithProviders(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
      expect(screen.getByText('Test Bug 2')).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusSelect);
    fireEvent.click(screen.getByText('Open'));

    expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Bug 2')).not.toBeInTheDocument();
  });

  it('filters bugs by priority', async () => {
    renderWithProviders(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
      expect(screen.getByText('Test Bug 2')).toBeInTheDocument();
    });

    const prioritySelect = screen.getByLabelText('Priority');
    fireEvent.mouseDown(prioritySelect);
    fireEvent.click(screen.getByText('High'));

    expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Bug 2')).not.toBeInTheDocument();
  });

  it('navigates to create bug page when create button is clicked', async () => {
    renderWithProviders(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Bug')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Create New Bug'));
    expect(mockNavigate).toHaveBeenCalledWith('/bugs/create');
  });

  it('navigates to bug detail page when view button is clicked', async () => {
    renderWithProviders(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('View')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View'));
    expect(mockNavigate).toHaveBeenCalledWith('/bugs/1');
  });

  it('shows delete button only for admin or bug creator', async () => {
    renderWithProviders(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
      expect(screen.getByText('Test Bug 2')).toBeInTheDocument();
    });

    // Delete button should be visible for admin
    expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
  });

  it('shows delete confirmation dialog when delete button is clicked', async () => {
    renderWithProviders(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('DeleteIcon'));
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
  });

  it('deletes bug when confirmed in dialog', async () => {
    axios.delete.mockResolvedValue({ data: { message: 'Bug deleted successfully' } });
    
    renderWithProviders(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
    });

    // Open delete dialog
    fireEvent.click(screen.getByTestId('DeleteIcon'));
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/bugs/1'),
        expect.any(Object)
      );
    });
  });

  it('handles delete error gracefully', async () => {
    axios.delete.mockRejectedValue(new Error('Failed to delete'));
    
    renderWithProviders(<BugList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Bug 1')).toBeInTheDocument();
    });

    // Open delete dialog
    fireEvent.click(screen.getByTestId('DeleteIcon'));
    
    // Confirm deletion
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Failed to delete bug')).toBeInTheDocument();
    });
  });
}); 