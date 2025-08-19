import React, { useState, useEffect, CSSProperties } from "react";
import Markdown from "markdown-to-jsx";
import { theme } from "antd";
import classnames from "classnames";
import { useClsAddPrefix } from "@/hooks";
import { Code, Loading, PdfViewer } from "@/components";
import { ICommonComponent } from "@/interface";
import { useGlobalData } from "@/context";
import { ROOT_PATH } from "@/utils/constants";
import "./style.scss";

interface IPost extends ICommonComponent {
  notePath: string;
}

const { useToken } = theme;

// 包装 Code 组件以适配 markdown-to-jsx 的 props 结构
const CodeBlock: React.FC<{ children: string; className?: string }> = ({ children, className, ...props }) => {
  // 从 className 中提取语言，格式通常是 "language-javascript"
  const language = className?.replace('language-', '') || 'javascript';

  return (
    <Code language={language} {...props}>
      {children}
    </Code>
  );
};

export const Post: React.FC<IPost> = (props) => {
  const { notePath, className } = props;
  const { token } = useToken();
  const prefixCls = useClsAddPrefix("post");
  const [postContent, setPostcontent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { globalData } = useGlobalData();
  const { themeType } = globalData;
  const isDark = themeType === "dark";
  useEffect(() => {
    // 动态导入 markdown 文件
    import(/* @vite-ignore */ `/${ROOT_PATH}/src/note/${notePath}?raw`).then((module) => {
      setPostcontent(module.default);
    });
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
      {isLoading && <Loading />}

      {error && (
        <div className="error-message">
          加载失败: {error}
        </div>
      )}

      {!isLoading && !error && postContent && (
        <Markdown
          options={{
            overrides: {
              // 处理代码块 ```language
              code: {
                component: ({ className, children, ...props }) => {
                  console.log('Code component called:', { className, children, props }); // 调试信息
                  // 检查是否是代码块（有 className）还是行内代码
                  if (className && className.startsWith('language-')) {
                    const language = className.replace('language-', '');
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
                  console.log('Pre component called:', { children }); // 调试信息
                  // 如果 children 是我们的 Code 组件，直接返回
                  if (React.isValidElement(children) && children.type === Code) {
                    return children;
                  }
                  return <pre {...props}>{children}</pre>;
                }
              },
              Loading: {
                component: Loading
              },
              PdfViewer: {
                component: PdfViewer
              }
            }
          }}
        >
          {postContent}
        </Markdown>
      )}
    </div>
  );
};