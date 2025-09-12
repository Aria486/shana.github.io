import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalSearch } from './GlobalSearch';

describe('GlobalSearch', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders search icon button initially', () => {
    render(<GlobalSearch onSearch={mockOnSearch} />);
    
    const searchButton = screen.getByRole('button', { name: /search\.buttonTitle/i });
    expect(searchButton).toBeInTheDocument();
  });

  it('expands search input when icon is clicked', async () => {
    const user = userEvent.setup();
    render(<GlobalSearch onSearch={mockOnSearch} />);
    
    const searchButton = screen.getByRole('button', { name: /search\.buttonTitle/i });
    await user.click(searchButton);
    
    await waitFor(() => {
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('calls onSearch when input value changes', async () => {
    const user = userEvent.setup();
    render(<GlobalSearch onSearch={mockOnSearch} />);
    
    // Expand the search
    const searchButton = screen.getByRole('button', { name: /search\.buttonTitle/i });
    await user.click(searchButton);
    
    // Type in the input
    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'test query');
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('shows clear button when there is input', async () => {
    const user = userEvent.setup();
    render(<GlobalSearch onSearch={mockOnSearch} />);
    
    // Expand and type
    const searchButton = screen.getByRole('button', { name: /search\.buttonTitle/i });
    await user.click(searchButton);
    
    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'test');
    
    // Clear button should appear
    const clearButton = screen.getByRole('button', { name: /search\.clearTitle/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<GlobalSearch onSearch={mockOnSearch} />);
    
    // Expand and type
    const searchButton = screen.getByRole('button', { name: /search\.buttonTitle/i });
    await user.click(searchButton);
    
    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'test');
    
    // Click clear button
    const clearButton = screen.getByRole('button', { name: /search\.clearTitle/i });
    await user.click(clearButton);
    
    expect(searchInput).toHaveValue('');
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('collapses when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<GlobalSearch onSearch={mockOnSearch} />);
    
    // Expand the search
    const searchButton = screen.getByRole('button', { name: /search\.buttonTitle/i });
    await user.click(searchButton);
    
    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'test');
    
    // Press Escape
    await user.keyboard('{Escape}');
    
    expect(mockOnSearch).toHaveBeenCalledWith('');
    
    // Should collapse back to icon
    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('uses custom placeholder when provided', async () => {
    const user = userEvent.setup();
    const customPlaceholder = 'Custom search placeholder';
    
    render(<GlobalSearch onSearch={mockOnSearch} placeholder={customPlaceholder} />);
    
    // Expand the search
    const searchButton = screen.getByRole('button', { name: /search\.buttonTitle/i });
    await user.click(searchButton);
    
    const searchInput = await screen.findByRole('textbox');
    expect(searchInput).toHaveAttribute('placeholder', customPlaceholder);
  });

  it('collapses when clicking outside and input is empty', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <GlobalSearch onSearch={mockOnSearch} />
        <div data-testid="outside">Outside element</div>
      </div>
    );
    
    // Expand the search
    const searchButton = screen.getByRole('button', { name: /search\.buttonTitle/i });
    await user.click(searchButton);
    
    await screen.findByRole('textbox');
    
    // Click outside
    const outsideElement = screen.getByTestId('outside');
    await user.click(outsideElement);
    
    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  it('does not collapse when clicking outside but input has value', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <GlobalSearch onSearch={mockOnSearch} />
        <div data-testid="outside">Outside element</div>
      </div>
    );
    
    // Expand and type
    const searchButton = screen.getByRole('button', { name: /search\.buttonTitle/i });
    await user.click(searchButton);
    
    const searchInput = await screen.findByRole('textbox');
    await user.type(searchInput, 'test');
    
    // Click outside
    const outsideElement = screen.getByTestId('outside');
    await user.click(outsideElement);
    
    // Should still be expanded
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});