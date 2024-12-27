import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AEFCalculator from '../src/components/AEFCalculator';

describe('AEF Calculator', () => {
  it('renders with default values', () => {
    render(<AEFCalculator />);
    
    // Check if calculator is rendered
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();

    // Verify default values
    expect(screen.getByRole('spinbutton', { name: /gross earnings base/i })).toHaveValue(100);
    expect(screen.getByRole('spinbutton', { name: /worklife adjustment/i })).toHaveValue(85.7);
    expect(screen.getByRole('spinbutton', { name: /unemployment factor/i })).toHaveValue(4.2);
    expect(screen.getByRole('spinbutton', { name: /income tax rate/i })).toHaveValue(22);
    expect(screen.getByRole('spinbutton', { name: /fringe benefits/i })).toHaveValue(23.5);
    expect(screen.getByRole('spinbutton', { name: /personal consumption/i })).toHaveValue(30);
  });

  it('handles input validation', async () => {
    render(<AEFCalculator />);
    
    // Set invalid values
    const baseInput = screen.getByRole('spinbutton', { name: /gross earnings base/i });
    const personalConsumptionInput = screen.getByRole('spinbutton', { name: /personal consumption/i });
    
    await act(async () => {
      await userEvent.clear(baseInput);
      await userEvent.type(baseInput, '-50');
      
      await userEvent.clear(personalConsumptionInput);
      await userEvent.type(personalConsumptionInput, '150');

      // Click calculate
      const calculateButton = screen.getByRole('button', { name: /calculate aef/i });
      await userEvent.click(calculateButton);
    });

    // Check error messages
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent('Value cannot be negative');
    expect(alerts[1]).toHaveTextContent('Personal consumption cannot exceed 100%');
  });

  it('toggles personal consumption input', async () => {
    render(<AEFCalculator />);
    
    const checkbox = screen.getByRole('checkbox', { name: /apply personal consumption/i });
    const input = screen.getByRole('spinbutton', { name: /personal consumption/i });
    
    expect(input).toBeVisible();

    // Toggle off
    await act(async () => {
      await userEvent.click(checkbox);
    });
    expect(input).not.toBeVisible();

    // Toggle on
    await act(async () => {
      await userEvent.click(checkbox);
    });
    expect(input).toBeVisible();
  });

  it('calculates with custom values', async () => {
    render(<AEFCalculator />);
    
    // Set custom values
    const inputs = {
      'gross earnings base': '90',
      'worklife adjustment': '80',
      'unemployment factor': '5',
      'income tax rate': '20',
      'fringe benefits': '25',
      'personal consumption': '25'
    };

    // Fill in each input
    await act(async () => {
      for (const [name, value] of Object.entries(inputs)) {
        const input = screen.getByRole('spinbutton', { name: new RegExp(name, 'i') });
        await userEvent.clear(input);
        await userEvent.type(input, value);
      }

      // Calculate
      const calculateButton = screen.getByRole('button', { name: /calculate aef/i });
      await userEvent.click(calculateButton);
    });

    // Verify results appear
    const resultsSection = screen.getByRole('region', { name: /calculation results/i });
    expect(resultsSection).toBeVisible();

    // Verify all result sections contain percentage values
    const resultIds = [
      'worklife-result',
      'unemployment-result',
      'tax-result',
      'benefits-result',
      'final-result'
    ];

    for (const id of resultIds) {
      const result = screen.getByTestId(id);
      expect(result).toBeVisible();
      expect(result.textContent).toMatch(/\d+\.\d+%$/);
    }
  });

  it('handles decimal inputs correctly', async () => {
    render(<AEFCalculator />);
    
    const baseInput = screen.getByRole('spinbutton', { name: /gross earnings base/i });
    
    await act(async () => {
      await userEvent.clear(baseInput);
      await userEvent.type(baseInput, '50.5');

      const calculateButton = screen.getByRole('button', { name: /calculate aef/i });
      await userEvent.click(calculateButton);
    });

    const resultsSection = screen.getByRole('region', { name: /calculation results/i });
    expect(resultsSection).toBeVisible();
  });

  it('maintains input state between calculations', async () => {
    render(<AEFCalculator />);
    
    const baseInput = screen.getByRole('spinbutton', { name: /gross earnings base/i });
    
    await act(async () => {
      await userEvent.clear(baseInput);
      await userEvent.type(baseInput, '75');

      const calculateButton = screen.getByRole('button', { name: /calculate aef/i });
      await userEvent.click(calculateButton);
    });

    expect(baseInput).toHaveValue(75);
  });
});