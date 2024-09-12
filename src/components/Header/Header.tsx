import React from "react";
import classnames from "classnames";
import { Button, Menu, MenuProps, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useClsAddPrefix } from "hooks";
import { ICommonComponent } from "interface";
import { useGlobalData } from "context";
import { ROOT_PATH } from "utils/constants";

import "./style.scss";

const { Title } = Typography;
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
  const { globalData, update } = useGlobalData();
  const { menu } = globalData;
  const { pathname } = useLocation();
  const nav = useNavigate();
  const isHome = ROOT_PATH === pathname.replace(/\//g, '');

  const getDetailTitle = (path: string) => {
    return decodeURI(path).split("/").at(-1);
  }

  const onClick: MenuProps['onClick'] = (e) => {
    update("menu", e.key)
  };

  return (
    <div className={classnames(prefixCls, className)}>
      {isHome ?
        <Menu
          className={`${prefixCls}-menu`}
          onClick={onClick}
          selectedKeys={[menu]}
          mode="horizontal"
          items={items}
        /> :
        <div className={`${prefixCls}-return`}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            shape="circle"
            onClick={() => nav(-1)}
          />
          <Title className={`${prefixCls}-return-title`} level={4}>
            {getDetailTitle(pathname)}
          </Title>
        </div>
      }
      {reactNode}
    </div>
  );
};