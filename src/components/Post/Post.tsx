import React, { useState, useEffect, CSSProperties } from "react";
import Markdown from "markdown-to-jsx";
import { theme } from "antd";
import classnames from "classnames";
import { useParams } from "react-router-dom";
import { useClsAddPrefix } from "@/hooks";
import { Code, Loading, GiscusComments } from "@/components";
import { ICommonComponent } from "@/interface";
import { useGlobalData } from "@/context";
import { mdModules } from "@/utils/constants";
import { markdownComponents } from "@/utils/markdownConfig";
import "./style.scss";

interface IPost extends ICommonComponent {
  notePath: string;
}

const { useToken } = theme;

export const Post: React.FC<IPost> = (props) => {
  const { notePath, className } = props;
  const { token } = useToken();
  const prefixCls = useClsAddPrefix("post");
  const [postContent, setPostcontent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { globalData } = useGlobalData();
  const { themeType } = globalData;
  const isDark = themeType === "dark";
  const { lang } = useParams<{ lang: string }>();

  // 语言代码映射
  const getLangCode = (langParam?: string): string => {
    switch (langParam) {
      case 'zh':
        return 'zh-CN';
      case 'en':
        return 'en';
      case 'ja':
        return 'ja';
      default:
        return 'zh-CN';
    }
  };

  async function loadMarkdown() {
    setIsLoading(true);
    const path = `/src/note/${notePath}`;
    const loader = mdModules[path];
    if (!loader) throw new Error('文件不存在');
    const content = await loader();
    setPostcontent(content);
    setIsLoading(false);
  }

  useEffect(() => {
    loadMarkdown();
  }, [notePath]);

  return (
    <div
      className={classnames(prefixCls, className)}
      style={
        {
          "--post-table-border-color": token["colorBorder"],
          "--post-table-th-bg-color": token["colorPrimaryBg"]
        } as CSSProperties
      }
    >
      {isLoading && (
        <div className={`${prefixCls}__loading-container`}>
          <Loading />
        </div>
      )}

      {!isLoading && postContent && (
        <>
          <Markdown
            options={{
              overrides: {
                // 处理标准 markdown 代码块 ```language
                code: {
                  component: ({ className, children, ...props }) => {
                    // 检查是否是代码块（有 className）还是行内代码
                    if (className && className.startsWith('lang-')) {
                      const language = className.replace('lang-', '');
                      return (
                        <Code language={language} isDark={isDark} {...props}>
                          {children}
                        </Code>
                      );
                    }
                    // 行内代码保持默认样式
                    return <code className={className} {...props}>{children}</code>;
                  }
                },
                // 处理 pre 元素（代码块的容器）
                pre: {
                  component: ({ children, ...props }) => {
                    // 如果 children 是我们的 Code 组件，直接返回
                    if (React.isValidElement(children) && children.type === Code) {
                      return children;
                    }
                    return <pre {...props}>{children}</pre>;
                  }
                },
                // 处理自定义的 Code 组件
                Code: {
                  component: ({ language, children, ...props }) => {
                    // 确保 children 是字符串
                    const codeContent = React.isValidElement(children)
                      ? (children.props as any).children
                      : Array.isArray(children)
                        ? children.join('')
                        : String(children || '');

                    return (
                      <Code language={language} isDark={isDark} {...props}>
                        {codeContent}
                      </Code>
                    );
                  }
                },
                // 解构自定义组件映射
                ...markdownComponents
              }
            }}
          >
            {postContent}
          </Markdown>
          <GiscusComments
            articlePath={notePath}
            theme={isDark ? 'dark' : 'light'}
            lang={getLangCode(lang)}
            lazy={true}
          />
        </>
      )}
    </div>
  );
};