import React, { useEffect, useRef, useState } from 'react';
import Giscus from '@giscus/react';
import { useClsAddPrefix } from '@/hooks';
import { ICommonComponent } from '@/interface';
import classnames from 'classnames';
import './style.scss';

export interface IGiscusComments extends ICommonComponent {
  /** 文章路径,用于生成唯一标识 */
  articlePath: string;
  /** 主题模式: 'light' | 'dark' */
  theme?: 'light' | 'dark';
  /** 语言代码: 'zh-CN' | 'en' | 'ja' */
  lang?: string;
  /** 是否启用懒加载 */
  lazy?: boolean;
}

export const GiscusComments: React.FC<IGiscusComments> = (props) => {
  const { articlePath, theme = 'light', lang = 'zh-CN', lazy = true, className } = props;
  const prefixCls = useClsAddPrefix('giscus-comments');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);

  // 懒加载逻辑
  useEffect(() => {
    if (!lazy) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // 提前100px加载
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy]);

  // Giscus 主题映射
  const giscusTheme = theme === 'dark' ? 'dark' : 'light';

  return (
    <div ref={containerRef} className={classnames(prefixCls, className)}>
      {isVisible ? (
        <Giscus
          repo="Aria486/shana.github.io"
          repoId="R_kgDOMaXcQA" // 需要从 giscus.app 获取
          category="Announcements"
          categoryId="DIC_kwDOMaXcQM4C1OZH" // 需要从 giscus.app 获取
          mapping="specific"
          term={articlePath}
          strict="0"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme={giscusTheme}
          lang={lang}
          loading="lazy"
        />
      ) : (
        <div className={`${prefixCls}-placeholder`}>
          <p>评论加载中...</p>
        </div>
      )}
    </div>
  );
};
