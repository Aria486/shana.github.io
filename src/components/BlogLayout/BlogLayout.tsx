import React, { useEffect } from "react";
import classnames from "classnames";
import { useParams, useLocation } from "react-router-dom";
import { Layout } from "antd";
import { Header, WeatherBackground } from "@/components";
import { useClsAddPrefix } from "@/hooks";
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
  [key: string]: any;
}
const { Footer, Sider, Content } = Layout;
export const BlogLayout: React.FC<IBlogLayout> = (props) => {
  const { className, header, footer, sider, content, sortType, onSortChange } = props;
  const prefixCls = useClsAddPrefix("layout");
  const { pathname } = useLocation();
  const urlParams = useParams();
  const lang = urlParams.lang;
  const { globalData } = useGlobalData();

  const useWeatherBackground = globalData.useWeatherBackground === true;

  // 根据背景模式切换 body 类名
  useEffect(() => {
    if (useWeatherBackground) {
      document.body.classList.add('weather-background-mode');
    } else {
      document.body.classList.remove('weather-background-mode');
    }
    return () => {
      document.body.classList.remove('weather-background-mode');
    };
  }, [useWeatherBackground]);

  // 判断是否在首页（显示笔记列表的页面）
  const isHome = `${ROOT_PATH}${lang}` === pathname.replace(/\//g, "");

  return (
    <Layout className={classnames(prefixCls, className, {
      [`${prefixCls}--weather-mode`]: useWeatherBackground,
    })}>
      {useWeatherBackground && <WeatherBackground />}
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
