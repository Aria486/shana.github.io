import React, { useState, useEffect } from "react";
import Markdown from "markdown-to-jsx";
import classnames from "classnames";
import { useClsAddPrefix } from "hooks";
import { Code, Loading, PdfViewer } from "components";
import { ICommonComponent } from "interface";
import { useGlobalData } from "context";
import "./style.scss";

interface IPost extends ICommonComponent {
  notePath: string;
}

export const Post: React.FC<IPost> = (props) => {
  const { notePath, className } = props;
  const prefixCls = useClsAddPrefix("post");
  const [postContent, setPostcontent] = useState("");
  const { globalData } = useGlobalData();
  const { themeType } = globalData;
  const isDark = themeType === "dark";

  useEffect(() => {
    void import(`note/${notePath}`).then((res) =>
      fetch(res.default)
        .then((response) => response.text())
        .then((response) => setPostcontent(response))
        .catch((err) => console.log(err)),
    );
  }, []);

  return (
    <div className={classnames(prefixCls, className)}>
      <Markdown
        options={{
          overrides: {
            Code: {
              component: Code,
              props: {
                isDark,
              },
            },
            Loading: {
              component: Loading,
            },
            PdfViewer: {
              component: PdfViewer,
            },
          },
        }}
      >
        {postContent}
      </Markdown>
    </div>
  );
};
