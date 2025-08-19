import React, { useState, useEffect, CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { theme } from "antd";
import classnames from "classnames";
import { useClsAddPrefix } from "@/hooks";
import { Loading, PdfViewer, CodeBlock } from "@/components";
import { ICommonComponent } from "@/interface";
import { useGlobalData } from "@/context";
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
  const { globalData } = useGlobalData();
  const { themeType } = globalData;
  const isDark = themeType === "dark";

  useEffect(() => {
    // 保持你原来的动态导入逻辑
    void import(`../../../public/note/${notePath}`).then((res) =>
      fetch(res.default)
        .then((response) => response.text())
        .then((response) => setPostcontent(response))
        .catch((err) => console.log(err))
    );
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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
      // components={{
      //   // 替换 overrides 为 components，但保持你的 Code 组件逻辑
      //   CodeBlock: ({ node, inline, className, children, ...props }) => {
      //     if (!inline) {
      //       return (
      //         <Code isDark={isDark} {...props}>
      //           {String(children)}
      //         </Code>
      //       );
      //     }
      //     return <code {...props}>{children}</code>;
      //   },
      // Loading: () => <Loading />,
      //   PdfViewer: (props) => <PdfViewer {...props} />
      // }}
      >
        {postContent}
      </ReactMarkdown>
    </div >
  );
};