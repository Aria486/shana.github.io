import React from "react";
import { ConfigProvider, theme } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

import { ThemeSwitch, BlogLayout, NoteList } from "components";
import { useGlobalData } from "context";

export type IThemeType = "dark" | "light";

export const Theme = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { globalData } = useGlobalData();
  const { themeType } = globalData;
  return (
    <ConfigProvider
      theme={{
        algorithm:
          themeType === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorBgLayout: themeType === "dark" ? "#000" : "#fff",
        },
        hashed: false,
        components: {
          Menu: {
            itemBg: themeType === "dark" ? "#000" : "#fff",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};
