import React, { useState } from "react";
import { ConfigProvider, theme } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

import { ThemeSwitch, BlogLayout } from "components";

export type IThemeType = "dark" | "light";

export const Theme = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [themeType, setThemeType] = useState<IThemeType>("light");
  return (
    <ConfigProvider
      theme={{
        algorithm:
          themeType === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorBgLayout: themeType === "dark" ? "#000" : "#fff",
        },
        cssVar: true,
        components: {
          Menu: {
            itemBg: themeType === "dark" ? "#000" : "#fff",
          }
        }
      }}
    >
      <BlogLayout
        header={
          <ThemeSwitch
            onClick={() =>
              setThemeType((preType) =>
                preType === "dark" ? "light" : "dark",
              )
            }
            icon={themeType === "dark" ? <SunOutlined /> : <MoonOutlined />}
          />
        }
        content={children}
        footer="© 2024"
      />
    </ConfigProvider>
  );
};