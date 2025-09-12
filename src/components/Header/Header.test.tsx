import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

// Mock the context and hooks
jest.mock('@/context', () => ({
  useGlobalData: () => ({
    globalData: { menu: 'program' },
    update: jest.fn(),
  }),
}));

jest.mock('@/hooks', () => ({
  useClsAddPrefix: (prefix: string) => prefix,
}));

jest.mock('@/utils/constants', () => ({
  ROOT_PATH: 'blog',
}));

describe('Header', () => {
  const mockOnSortChange = jest.fn();

  beforeEach(() => {
    mockOnSortChange.mockClear();
  });


  it('renders language selector', () => {
    render(<Header />);

    // Should have language selector
    expect(screen.getByTitle('中文')).toBeInTheDocument();
  });

  it('renders sort dropdown when showSort is true', () => {
    render(<Header showSort={true} sortType="time" onSortChange={mockOnSortChange} />);

    const sortSelect = screen.getByTitle('sort.time');
    expect(sortSelect).toBeInTheDocument();
  });

  it('does not render sort dropdown when showSort is false', () => {
    render(<Header showSort={false} />);

    expect(screen.queryByTitle('sort.time')).not.toBeInTheDocument();
  });


  it('renders back button and title when not on home page', () => {
    // Mock useLocation to return non-home path
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useLocation: () => ({
        pathname: '/blog/zh-CN/note/test-note',
      }),
      useParams: () => ({
        lang: 'zh-CN',
      }),
    }));

    const { rerender } = render(<Header />);
    rerender(<Header />);

    // Should show back button
    const backButton = screen.getByRole('button');
    expect(backButton).toBeInTheDocument();
  });

  it('renders custom reactNode when provided', () => {
    const customNode = <div data-testid="custom-node">Custom Content</div>;
    render(<Header reactNode={customNode} />);

    expect(screen.getByTestId('custom-node')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Header className="custom-header" />);

    expect(container.firstChild).toHaveClass('custom-header');
  });


});