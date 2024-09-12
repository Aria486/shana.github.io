import React from "react";
import { useParams } from "react-router-dom";
import { useClsAddPrefix } from "hooks";
import { ICommonComponent } from "interface";
import { useGlobalData } from "context";
import { Post } from "components";

import "./style.scss";

export interface INoteDetail extends ICommonComponent {
  reactNode?: React.ReactNode;
}


export const NoteDetail: React.FC<INoteDetail> = (props) => {
  const { reactNode, className } = props;
  const prefixCls = useClsAddPrefix("note-detail");
  const urlParams = useParams();
  const { globalData, update } = useGlobalData();

  return (
    <div>
      <div>aaaa</div>
      {urlParams["*"] && <Post notePath={urlParams["*"]} />}
    </div>
  );
};