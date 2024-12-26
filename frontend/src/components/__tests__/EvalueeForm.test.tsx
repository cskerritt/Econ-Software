import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EvalueeForm from '../EvalueeForm';
import { evalueeService } from '../../services/evalueeService';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock evalueeService
vi.mock('../../services/evalueeService', () => ({
  evalueeService: {
    create: vi.fn((data) => {
      if (!data.first_name || !data.last_name || !data.date_of_birth) {
        return Promise.reject(new Error('Required fields are missing'));
      }
      return Promise.resolve({
        id: 1,
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      });
    })
  }
}));

describe('EvalueeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all required fields', () => {
    render(
      <BrowserRouter>
        <EvalueeForm />
      </BrowserRouter>
    );

    expect(screen.getByTestId('first-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('last-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('date-of-birth-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create evaluee/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(
      <BrowserRouter>
        <EvalueeForm />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /create evaluee/i });
    fireEvent.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      const firstNameInput = screen.getByTestId('first-name-input');
      const lastNameInput = screen.getByTestId('last-name-input');
      const dateInput = screen.getByTestId('date-of-birth-input');

      expect(firstNameInput).toHaveAttribute('aria-invalid', 'true');
      expect(lastNameInput).toHaveAttribute('aria-invalid', 'true');
      expect(dateInput).toHaveAttribute('aria-invalid', 'true');

      // Find the helper text elements
      const helperTexts = screen.getAllByText(/is required/i);
      expect(helperTexts).toHaveLength(3);
    });
  });

  it('handles form submission correctly', async () => {
    render(
      <BrowserRouter>
        <EvalueeForm />
      </BrowserRouter>
    );

    // Fill in form fields
    const firstNameInput = screen.getByTestId('first-name-input');
    const lastNameInput = screen.getByTestId('last-name-input');
    const dateInput = screen.getByTestId('date-of-birth-input');

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(dateInput, { target: { value: '1990-01-01' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create evaluee/i });
    fireEvent.click(submitButton);

    // Wait for navigation
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles server errors', async () => {
    const mockError = 'Server error occurred';
    vi.mocked(evalueeService.create).mockRejectedValueOnce(new Error(mockError));

    render(
      <BrowserRouter>
        <EvalueeForm />
      </BrowserRouter>
    );

    // Fill in form fields
    const firstNameInput = screen.getByTestId('first-name-input');
    const lastNameInput = screen.getByTestId('last-name-input');
    const dateInput = screen.getByTestId('date-of-birth-input');

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(dateInput, { target: { value: '1990-01-01' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create evaluee/i });
    fireEvent.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to create evaluee')).toBeInTheDocument();
    });
  });
});
