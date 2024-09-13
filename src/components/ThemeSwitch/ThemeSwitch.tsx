import React from "react";
import classnames from "classnames";
import { Button } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

import { useClsAddPrefix } from "hooks";
import { useGlobalData } from "context";

export interface IThemeSwitch {
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  [key: string]: any;
}

export const ThemeSwitch: React.FC<IThemeSwitch> = (props) => {
  const { className } = props;
  const prefixCls = useClsAddPrefix("theme-switch");
  const { globalData, update } = useGlobalData();
  const { themeType } = globalData;
  return (
    <Button
      type="text"
      className={classnames(prefixCls, className)}
      shape="circle"
      onClick={() =>
        update("themeType", themeType === "dark" ? "light" : "dark")
      }
      icon={themeType === "dark" ? <SunOutlined /> : <MoonOutlined />}
    />
  );
};
