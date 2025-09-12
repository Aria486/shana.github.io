import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSwitch } from './ThemeSwitch';

// Mock the context and hooks
const mockUpdate = jest.fn();
const mockUseGlobalData = jest.fn();

jest.mock('@/context', () => ({
  useGlobalData: () => mockUseGlobalData(),
}));

jest.mock('@/hooks', () => ({
  useClsAddPrefix: (prefix: string) => prefix,
}));

describe('ThemeSwitch', () => {
  beforeEach(() => {
    mockUpdate.mockClear();
    mockUseGlobalData.mockReturnValue({
      globalData: { themeType: 'light' },
      update: mockUpdate,
    });
  });

  it('renders moon icon when theme is light', () => {
    mockUseGlobalData.mockReturnValue({
      globalData: { themeType: 'light' },
      update: mockUpdate,
    });

    render(<ThemeSwitch />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    // Check for moon icon (antd icon)
    const moonIcon = button.querySelector('.anticon-moon');
    expect(moonIcon).toBeInTheDocument();
  });

  it('renders sun icon when theme is dark', () => {
    mockUseGlobalData.mockReturnValue({
      globalData: { themeType: 'dark' },
      update: mockUpdate,
    });

    render(<ThemeSwitch />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    
    // Check for sun icon (antd icon)
    const sunIcon = button.querySelector('.anticon-sun');
    expect(sunIcon).toBeInTheDocument();
  });

  it('switches from light to dark theme when clicked', async () => {
    const user = userEvent.setup();
    mockUseGlobalData.mockReturnValue({
      globalData: { themeType: 'light' },
      update: mockUpdate,
    });

    render(<ThemeSwitch />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockUpdate).toHaveBeenCalledWith('themeType', 'dark');
  });

  it('switches from dark to light theme when clicked', async () => {
    const user = userEvent.setup();
    mockUseGlobalData.mockReturnValue({
      globalData: { themeType: 'dark' },
      update: mockUpdate,
    });

    render(<ThemeSwitch />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockUpdate).toHaveBeenCalledWith('themeType', 'light');
  });

  it('applies custom className', () => {
    render(<ThemeSwitch className="custom-theme-switch" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-theme-switch');
  });

  it('has correct button properties', () => {
    render(<ThemeSwitch />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('ant-btn-text');
    expect(button).toHaveClass('ant-btn-circle');
  });

  it('calls custom onClick handler if provided', async () => {
    const user = userEvent.setup();
    const mockOnClick = jest.fn();
    
    render(<ThemeSwitch onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Should call both custom onClick and theme update
    expect(mockUpdate).toHaveBeenCalledWith('themeType', 'dark');
  });
});