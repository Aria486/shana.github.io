import { useClsAddPrefix, prefixCls } from './useClsAddPrefix';

describe('useClsAddPrefix', () => {
  it('returns correct prefixed class name', () => {
    const result = useClsAddPrefix('header');
    expect(result).toBe('shana-blog-header');
  });

  it('handles empty string', () => {
    const result = useClsAddPrefix('');
    expect(result).toBe('shana-blog-');
  });

  it('handles class names with hyphens', () => {
    const result = useClsAddPrefix('search-input');
    expect(result).toBe('shana-blog-search-input');
  });

  it('handles class names with underscores', () => {
    const result = useClsAddPrefix('theme_switch');
    expect(result).toBe('shana-blog-theme_switch');
  });

  it('handles class names with numbers', () => {
    const result = useClsAddPrefix('item-1');
    expect(result).toBe('shana-blog-item-1');
  });

  it('handles special characters', () => {
    const result = useClsAddPrefix('component@test');
    expect(result).toBe('shana-blog-component@test');
  });

  it('uses correct prefix constant', () => {
    expect(prefixCls).toBe('shana-blog');
  });

  it('maintains consistency across multiple calls', () => {
    const result1 = useClsAddPrefix('button');
    const result2 = useClsAddPrefix('button');
    expect(result1).toBe(result2);
  });

  it('handles long class names', () => {
    const longClassName = 'very-long-component-name-with-multiple-parts';
    const result = useClsAddPrefix(longClassName);
    expect(result).toBe(`shana-blog-${longClassName}`);
  });

  it('preserves case sensitivity', () => {
    const result1 = useClsAddPrefix('Header');
    const result2 = useClsAddPrefix('header');
    expect(result1).toBe('shana-blog-Header');
    expect(result2).toBe('shana-blog-header');
    expect(result1).not.toBe(result2);
  });
});