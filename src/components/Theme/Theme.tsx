import React, { useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import { useGlobalData } from "@/context";

export type IThemeType = "dark" | "light";

export const Theme = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { globalData } = useGlobalData();
  const { themeType } = globalData;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeType);
  }, [themeType]);
  return (
    <ConfigProvider
      theme={{
        algorithm:
          themeType === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorBgLayout: themeType === "dark" ? "#000" : "#fff"
        },
        hashed: false,
        components: {
          Menu: {
            itemBg: themeType === "dark" ? "#000" : "#fff"
          }
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
};
