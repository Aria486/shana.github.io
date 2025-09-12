import React from "react";
import classnames from "classnames";
import { useParams, useLocation } from "react-router-dom";
import { Layout } from "antd";
import { Header } from "@/components";
import { useClsAddPrefix } from "@/hooks";
import { ROOT_PATH } from "@/utils/constants";

import "./style.scss";

export interface IBlogLayout {
  children?: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sider?: React.ReactNode;
  content?: React.ReactNode;
  sortType?: string;
  onSortChange?: (sortType: string) => void;
  [key: string]: any;
}
const { Footer, Sider, Content } = Layout;
export const BlogLayout: React.FC<IBlogLayout> = (props) => {
  const { className, header, footer, sider, content, sortType, onSortChange } = props;
  const prefixCls = useClsAddPrefix("layout");
  const { pathname } = useLocation();
  const urlParams = useParams();
  const lang = urlParams.lang;

  // 判断是否在首页（显示笔记列表的页面）
  const isHome = `${ROOT_PATH}${lang}` === pathname.replace(/\//g, "");
  return (
    <Layout className={classnames(prefixCls, className)}>
      <div className={classnames(`${prefixCls}-header`)}>
        <Header
          reactNode={header}
          showSort={isHome}
          sortType={sortType}
          onSortChange={onSortChange}
        />
      </div>
      <div className={classnames(`${prefixCls}-divider`)} />
      <Layout className={classnames(`${prefixCls}-content`)}>
        {sider && <Sider width="25%">{sider}</Sider>}
        {content && (
          <Content className={classnames(`${prefixCls}-content-inner`)}>
            {content}
          </Content>
        )}
      </Layout>
      {footer && <Footer className={`${prefixCls}-footer`}>{footer}</Footer>}
    </Layout>
  );
};
