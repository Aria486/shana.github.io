"use client";

import React, { useState } from "react";
import { ConfigProvider, theme } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

import { ThemeSwitch, BlogLayout } from "@/components";

export type IThemeType = "dark" | "light";

export const Theme = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [themeType, setThemeType] = useState<IThemeType>("light");

  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm:
            themeType === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorBgLayout: themeType === "dark" ? "#000" : "#fff",
          },
          cssVar: true,
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
          footer="© 2021"
        />
      </ConfigProvider>
    </AntdRegistry>
  );
};
