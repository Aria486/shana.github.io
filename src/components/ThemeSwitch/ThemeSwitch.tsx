import React from "react";
import classnames from "classnames";

import { Button } from "antd";
import { useClsAddPrefix } from "hooks";

export interface IThemeSwitch {
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  [key: string]: any;
}

export const ThemeSwitch: React.FC<IThemeSwitch> = (props) => {
  const { className, icon, onClick } = props;
  const prefixCls = useClsAddPrefix("theme-switch");

  return (
    <Button
      type="text"
      className={classnames(prefixCls, className)}
      shape="circle"
      onClick={onClick}
      icon={icon}
    />
  );
};