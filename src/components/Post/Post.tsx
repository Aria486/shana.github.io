import React, { useState, useEffect } from "react";
import Markdown from "markdown-to-jsx";
import { theme } from "antd";
import { Code, Loading } from "components";
import "styles/post.css";

interface IPost {
  notePath: string
}
const { useToken } = theme;
export const Post: React.FC<IPost> = (props) => {
  const { notePath } = props;
  const [postContent, setPostcontent] = useState("");
  const isDark = useToken().token.colorBgLayout === "#000";
  console.log(notePath)
  useEffect(() => {
    void import(`note/${notePath}`).then((res) =>
      fetch(res.default)
        .then((response) => response.text())
        .then((response) => setPostcontent(response))
        .catch((err) => console.log(err)),
    );
  }, []);

  return (
    <div className="article-wrapper">
      <article>
        <header></header>
        <main>
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
                  component: Loading
                }
              },
            }}
          >
            {postContent}
          </Markdown>
        </main>
      </article>
    </div>
  );
};
