import { render, screen } from '@testing-library/react';
import { GiscusComments } from './GiscusComments';

// Mock Giscus 组件
jest.mock('@giscus/react', () => ({
  __esModule: true,
  default: ({ articlePath, theme, lang }: any) => (
    <div data-testid="giscus-mock" data-article={articlePath} data-theme={theme} data-lang={lang}>
      Mocked Giscus Component
    </div>
  ),
}));

describe('GiscusComments', () => {
  it('应该正常渲染组件', () => {
    render(<GiscusComments articlePath="/test/article" lazy={false} />);
    expect(screen.getByTestId('giscus-mock')).toBeInTheDocument();
  });

  it('应该接收正确的 props', () => {
    render(
      <GiscusComments
        articlePath="/test/article"
        theme="dark"
        lang="en"
        lazy={false}
      />
    );
    const giscus = screen.getByTestId('giscus-mock');
    expect(giscus).toHaveAttribute('data-article', '/test/article');
    expect(giscus).toHaveAttribute('data-theme', 'dark');
    expect(giscus).toHaveAttribute('data-lang', 'en');
  });

  it('主题切换时应该更新配置', () => {
    const { rerender } = render(
      <GiscusComments articlePath="/test/article" theme="light" lazy={false} />
    );
    expect(screen.getByTestId('giscus-mock')).toHaveAttribute('data-theme', 'light');

    rerender(<GiscusComments articlePath="/test/article" theme="dark" lazy={false} />);
    expect(screen.getByTestId('giscus-mock')).toHaveAttribute('data-theme', 'dark');
  });

  it('语言切换时应该更新配置', () => {
    const { rerender } = render(
      <GiscusComments articlePath="/test/article" lang="zh-CN" lazy={false} />
    );
    expect(screen.getByTestId('giscus-mock')).toHaveAttribute('data-lang', 'zh-CN');

    rerender(<GiscusComments articlePath="/test/article" lang="ja" lazy={false} />);
    expect(screen.getByTestId('giscus-mock')).toHaveAttribute('data-lang', 'ja');
  });

  it('懒加载模式下应该显示占位符', () => {
    render(<GiscusComments articlePath="/test/article" lazy={true} />);
    expect(screen.getByText('评论加载中...')).toBeInTheDocument();
  });

  it('articlePath 应该正确映射为 term', () => {
    render(<GiscusComments articlePath="/program/react/hooks" lazy={false} />);
    const giscus = screen.getByTestId('giscus-mock');
    expect(giscus).toHaveAttribute('data-article', '/program/react/hooks');
  });
});
