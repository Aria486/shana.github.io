import React, { useState, useEffect } from "react";
import Markdown from "markdown-to-jsx";
import { Code } from "components/Code";

import "styles/post.css";

export const Post = () => {
  const [postContent, setPostcontent] = useState("");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    void import("note/template.md").then((res) =>
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
                    setIsDark,
                  },
                },
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
