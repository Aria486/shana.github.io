import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { useParams, useLocation } from "react-router-dom";
import { Layout, Drawer } from "antd";
import { MenuUnfoldOutlined } from "@ant-design/icons";
import { Header, WeatherBackground } from "@/components";
import { useClsAddPrefix, useIsMobile } from "@/hooks";
import { useGlobalData } from "@/context";
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
  /** 侧边栏初始展开状态，主要用于测试 */
  defaultSiderOpen?: boolean;
  [key: string]: unknown;
}

const { Footer, Sider, Content } = Layout;

export const BlogLayout: React.FC<IBlogLayout> = (props) => {
  const {
    className,
    header,
    footer,
    sider,
    content,
    sortType,
    onSortChange,
    defaultSiderOpen = false,
  } = props;

  const prefixCls = useClsAddPrefix("layout");
  const { pathname } = useLocation();
  const urlParams = useParams();
  const lang = urlParams.lang;
  const { globalData } = useGlobalData();
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(defaultSiderOpen);

  const useWeatherBackground = globalData.useWeatherBackground === true;

  // 切换桌面端时自动关闭 Drawer
  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  // 根据背景模式切换 body 类名
  useEffect(() => {
    if (useWeatherBackground) {
      document.body.classList.add("weather-background-mode");
    } else {
      document.body.classList.remove("weather-background-mode");
    }
    return () => {
      document.body.classList.remove("weather-background-mode");
    };
  }, [useWeatherBackground]);

  // 判断是否在首页（显示笔记列表的页面）
  const isHome = `${ROOT_PATH}${lang}` === pathname.replace(/\//g, "");

  return (
    <Layout
      className={classnames(prefixCls, className, {
        [`${prefixCls}--weather-mode`]: useWeatherBackground,
      })}
    >
      {useWeatherBackground && <WeatherBackground />}
      <div className={classnames(`${prefixCls}-header`)}>
        {/* 汉堡按钮：仅在移动端且有侧边栏时渲染 */}
        {isMobile && sider && (
          <button
            className={`${prefixCls}-header-menu-trigger`}
            onClick={() => setDrawerOpen(true)}
            aria-label="打开侧边栏"
            aria-expanded={drawerOpen}
          >
            <MenuUnfoldOutlined />
          </button>
        )}
        <Header
          reactNode={header}
          showSort={isHome}
          sortType={sortType}
          onSortChange={onSortChange}
        />
      </div>
      <div className={classnames(`${prefixCls}-divider`)} />
      <Layout className={classnames(`${prefixCls}-content`)}>
        {/* 桌面端：固定侧边栏 */}
        {!isMobile && sider && <Sider width="25%">{sider}</Sider>}
        {content && (
          <Content className={classnames(`${prefixCls}-content-inner`)}>
            {content}
          </Content>
        )}
      </Layout>
      {/* 移动端：抽屉侧边栏 */}
      {isMobile && sider && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={280}
          styles={{ body: { padding: 0 } }}
          aria-label="侧边栏"
        >
          <div className={`${prefixCls}-drawer-content`}>{sider}</div>
        </Drawer>
      )}
      {footer && <Footer className={`${prefixCls}-footer`}>{footer}</Footer>}
    </Layout>
  );
};
