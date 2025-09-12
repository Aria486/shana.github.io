import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Footer } from './Footer';

// Mock dependencies
jest.mock('@/hooks', () => ({
  useClsAddPrefix: (prefix: string) => prefix,
}));

jest.mock('@/utils/constants', () => ({
  ROOT_PATH: 'blog',
}));

jest.mock('@/components', () => ({
  ThemeSwitch: () => <div data-testid="theme-switch">Theme Switch</div>,
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useLocation: () => ({
    pathname: '/blog/zh-CN',
  }),
  useNavigate: () => jest.fn(),
  useParams: () => ({
    lang: 'zh-CN',
  }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'footer.copyright': '版权所有',
        'footer.description': '记录学习的点点滴滴',
        'footer.contact': '联系我们',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

describe('Footer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<Footer />);

    // 检查描述
    expect(screen.getByText('记录学习的点点滴滴')).toBeInTheDocument();

    // 检查主题切换
    expect(screen.getByTestId('theme-switch')).toBeInTheDocument();

    // 检查联系我们链接
    expect(screen.getByText('联系我们')).toBeInTheDocument();
  });

  it('renders language selector by default', () => {
    render(<Footer />);

    // Ant Design Select 使用 title 属性来显示选中的值
    expect(screen.getByTitle('中文')).toBeInTheDocument();
    // 由于下拉菜单默认不展开，我们只测试选中的值
  });

  it('hides theme switch when showThemeSwitch is false', () => {
    render(<Footer showThemeSwitch={false} />);

    expect(screen.queryByTestId('theme-switch')).not.toBeInTheDocument();
  });

  it('hides language selector when showLanguageSwitch is false', () => {
    render(<Footer showLanguageSwitch={false} />);

    expect(screen.queryByDisplayValue('中文')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Footer className="custom-footer" />);

    expect(container.firstChild).toHaveClass('custom-footer');
  });

  it('handles language change', async () => {
    const user = userEvent.setup();
    const mockNavigate = jest.fn();
    const mockChangeLanguage = jest.fn();

    // Mock the hooks with specific implementations
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    jest.spyOn(require('react-i18next'), 'useTranslation').mockReturnValue({
      t: (key: string) => key,
      i18n: { changeLanguage: mockChangeLanguage },
    });

    render(<Footer />);

    // 点击语言选择器展开下拉菜单
    const languageSelect = screen.getByTitle('中文');
    await user.click(languageSelect);

    // 选择英文选项
    const englishOption = screen.getByText('English');
    await user.click(englishOption);

    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('maintains layout structure', () => {
    const { container } = render(<Footer />);

    const content = container.querySelector('.footer-content');
    expect(content).toBeInTheDocument();

    const infoSection = container.querySelector('.footer-info');
    expect(infoSection).toBeInTheDocument();

    const actionsSection = container.querySelector('.footer-actions');
    expect(actionsSection).toBeInTheDocument();

    const linksSection = container.querySelector('.footer-links');
    expect(linksSection).toBeInTheDocument();
  });
});