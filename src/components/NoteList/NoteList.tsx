import React, { useState } from "react";
import classnames from "classnames";
import { Avatar, List } from "antd";
import { useNavigate } from "react-router-dom";
import { useClsAddPrefix } from "hooks";
import { ICommonComponent } from "interface";
import { useGlobalData } from "context";
import { allPaths } from "route";

import "./style.scss";

export interface INoteList extends ICommonComponent {
  reactNode?: React.ReactNode;
}


export const NoteList: React.FC<INoteList> = (props) => {
  const { reactNode, className } = props;
  const prefixCls = useClsAddPrefix("note-list");
  const { globalData, update } = useGlobalData();
  const nav = useNavigate();
  const { menu } = globalData;
  const getTag = (path: string) => {
    const pathArr = path.split("/");
    return pathArr.at(-2);
  }
  return (
    <List
      className={classnames(prefixCls, className)}
      dataSource={allPaths[menu]?.map((item) => ({ ...item, title: item.name }))}
      renderItem={(item) =>
        <List.Item
          className={`${prefixCls}-item`}
          onClick={() => nav(`note/${item.path}`)}
        >
          <List.Item.Meta
            avatar={<Avatar size={40} style={{ background: item?.bgColor }}>{getTag(item.path)}</Avatar>}
            title={item.title}
            description={item.lastModified}
          />
        </List.Item>}
      locale={{
        emptyText: "还没有内容"
      }}
    />
  );
};