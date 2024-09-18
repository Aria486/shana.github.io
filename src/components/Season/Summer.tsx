import React from "react";
import { useClsAddPrefix } from "hooks";
import classnames from "classnames";
import "./style.scss";

export const Summer: React.FC = () => {
  const cls = useClsAddPrefix("season-summer-wave");

  return (
    <div className={cls}>
      <div className={`${cls}-cell01`}>
        {Array.from({ length: 15 }, (_, index) => (
          <div key={index} className={`wave-${index + 1}`}></div>
        ))}
      </div>
      <div className={`${cls}-cell02`}>
        {Array.from({ length: 15 }, (_, index) => (
          <div key={index} className={`wave-${index + 1}`}></div>
        ))}
      </div>
    </div>
  );
};
