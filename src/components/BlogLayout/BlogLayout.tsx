import React from "react";
import classnames from "classnames";
import { Layout } from "antd";
import { useClsAddPrefix } from "@/hooks";

import "./style.scss";

export interface IBlogLayout {
  children?: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sider?: React.ReactNode;
  content?: React.ReactNode;
  [key: string]: any;
}
const { Footer, Sider, Content } = Layout;
export const BlogLayout: React.FC<IBlogLayout> = (props) => {
  const { className, header, footer, sider, content } = props;
  const prefixCls = useClsAddPrefix("layout");

  return (
    <Layout className={classnames(prefixCls, className)}>
      <div className={classnames(`${prefixCls}-header`)}>{header}</div>
      <div className={classnames(`${prefixCls}-divider`)} />
      <Layout className={classnames(`${prefixCls}-content`)}>
        {sider && <Sider width="25%">{sider}</Sider>}
        {content && <Content>{content}</Content>}
      </Layout>
      {footer && <Footer>{footer}</Footer>}
    </Layout>
  );
};
