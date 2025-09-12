import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

jest.mock('@/hooks', () => ({
  useClsAddPrefix: (prefix: string) => prefix,
}));

describe('Pagination', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders nothing when total is 0', () => {
    const { container } = render(
      <Pagination
        current={1}
        total={0}
        pageSize={10}
        onChange={mockOnChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders simple pagination when simple prop is true', () => {
    render(
      <Pagination
        current={1}
        total={50}
        pageSize={10}
        onChange={mockOnChange}
        simple={true}
      />
    );

    expect(screen.getByText('pagination.prev')).toBeInTheDocument();
    expect(screen.getByText('pagination.next')).toBeInTheDocument();
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });

  it('renders page numbers correctly', () => {
    render(
      <Pagination
        current={3}
        total={100}
        pageSize={10}
        onChange={mockOnChange}
      />
    );

    // Should show page numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('calls onChange when page number is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        current={1}
        total={50}
        pageSize={10}
        onChange={mockOnChange}
      />
    );

    const page2Button = screen.getByText('2');
    await user.click(page2Button);

    expect(mockOnChange).toHaveBeenCalledWith(2, 10);
  });

  it('calls onChange when previous button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        current={3}
        total={50}
        pageSize={10}
        onChange={mockOnChange}
      />
    );

    const prevButton = screen.getByTestId('prev-button');
    await user.click(prevButton);

    expect(mockOnChange).toHaveBeenCalledWith(2, 10);
  });

  it('calls onChange when next button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        current={1}
        total={50}
        pageSize={10}
        onChange={mockOnChange}
      />
    );

    const nextButton = screen.getByTestId('next-button');
    await user.click(nextButton);

    expect(mockOnChange).toHaveBeenCalledWith(2, 10);
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination
        current={1}
        total={50}
        pageSize={10}
        onChange={mockOnChange}
      />
    );

    const prevButton = screen.getByTestId('prev-button');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination
        current={5}
        total={50}
        pageSize={10}
        onChange={mockOnChange}
      />
    );

    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeDisabled();
  });

  it('renders page size changer when showSizeChanger is true', () => {
    render(
      <Pagination
        current={1}
        total={50}
        pageSize={10}
        onChange={mockOnChange}
        showSizeChanger={true}
      />
    );

    const sizeSelect = screen.getByDisplayValue('10 pagination.itemsPerPage');
    expect(sizeSelect).toBeInTheDocument();
  });

  it('calls onChange when page size is changed', () => {
    render(
      <Pagination
        current={1}
        total={50}
        pageSize={10}
        onChange={mockOnChange}
        showSizeChanger={true}
      />
    );

    const sizeSelect = screen.getByDisplayValue('10 pagination.itemsPerPage');
    fireEvent.change(sizeSelect, { target: { value: '20' } });

    expect(mockOnChange).toHaveBeenCalledWith(1, 20);
  });

  it('renders quick jumper when showQuickJumper is true', () => {
    render(
      <Pagination
        current={1}
        total={50}
        pageSize={10}
        onChange={mockOnChange}
        showQuickJumper={true}
      />
    );

    expect(screen.getByPlaceholderText('pagination.placeholder')).toBeInTheDocument();
  });


  it('renders showTotal when provided', () => {
    const showTotal = (total: number, range: [number, number]) =>
      `Total ${total} items, showing ${range[0]}-${range[1]}`;

    render(
      <Pagination
        current={1}
        total={50}
        pageSize={10}
        onChange={mockOnChange}
        showTotal={showTotal}
      />
    );

    expect(screen.getByText('Total 50 items, showing 1-10')).toBeInTheDocument();
  });

  it('shows ellipsis for large page counts', () => {
    render(
      <Pagination
        current={5}
        total={200}
        pageSize={10}
        onChange={mockOnChange}
      />
    );

    // Should show ellipsis
    const ellipsis = screen.getAllByText('•••')[0];
    expect(ellipsis).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Pagination
        current={1}
        total={50}
        pageSize={10}
        onChange={mockOnChange}
        className="custom-pagination"
      />
    );

    expect(container.firstChild).toHaveClass('custom-pagination');
  });
});