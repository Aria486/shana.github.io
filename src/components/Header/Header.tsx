import React, { useState } from "react";
import classnames from "classnames";
import { Menu, MenuProps } from "antd";
import { useClsAddPrefix } from "hooks";
import { ICommonComponent } from "interface";

import "./style.scss";

export interface IHeader extends ICommonComponent {
  reactNode?: React.ReactNode;
}

type MenuItem = Required<MenuProps>['items'][number];
const items: MenuItem[] = [
  {
    label: '编程',
    key: 'program',
  },
  {
    label: '历史',
    key: 'history',
  },
  {
    label: '游戏',
    key: 'game',
  },
  {
    label: "小说",
    key: 'novel',
  },
  {
    label: '宗教',
    key: ' religion',
  },
];

export const Header: React.FC<IHeader> = (props) => {
  const { reactNode, className } = props;
  const prefixCls = useClsAddPrefix("header");
  const [current, setCurrent] = useState('program');

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
  };

  return (
    <div className={classnames(prefixCls, className)}>
      <Menu
        className={`${prefixCls}-menu`}
        onClick={onClick}
        selectedKeys={[current]}
        mode="horizontal"
        items={items}
      />
      {reactNode}
    </div>
  );
};