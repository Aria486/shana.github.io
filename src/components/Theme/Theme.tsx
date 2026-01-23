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
  const { themeType, useWeatherBackground } = globalData;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeType);
  }, [themeType]);

  // 天气背景模式下的透明主题配置
  const weatherThemeToken = useWeatherBackground ? {
    colorBgBase: 'transparent',
    colorBgContainer: 'rgba(255, 255, 255, 0.1)',
    colorBgElevated: 'rgba(255, 255, 255, 0.15)',
    colorBgLayout: 'transparent',
    colorBgSpotlight: 'rgba(255, 255, 255, 0.2)',
    colorBorder: 'rgba(255, 255, 255, 0.3)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.2)',
    colorText: 'rgba(255, 255, 255, 0.9)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.5)',
    colorTextQuaternary: 'rgba(255, 255, 255, 0.3)',
    colorFill: 'rgba(255, 255, 255, 0.1)',
    colorFillSecondary: 'rgba(255, 255, 255, 0.08)',
    colorFillTertiary: 'rgba(255, 255, 255, 0.05)',
    colorFillQuaternary: 'rgba(255, 255, 255, 0.03)',
  } : {
    colorBgLayout: themeType === "dark" ? "#000" : "#fff"
  };

  const weatherComponents = useWeatherBackground ? {
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      itemSelectedBg: 'rgba(24, 144, 255, 0.3)',
      itemHoverBg: 'rgba(255, 255, 255, 0.15)',
      itemActiveBg: 'rgba(255, 255, 255, 0.2)',
    },
    Select: {
      optionSelectedBg: 'rgba(24, 144, 255, 0.3)',
      optionActiveBg: 'rgba(255, 255, 255, 0.15)',
    },
    Button: {
      defaultBg: 'rgba(255, 255, 255, 0.1)',
      defaultBorderColor: 'rgba(255, 255, 255, 0.3)',
    },
    Input: {
      activeBg: 'rgba(255, 255, 255, 0.15)',
    },
    Modal: {
      contentBg: 'rgba(30, 30, 30, 0.95)',
      headerBg: 'rgba(40, 40, 40, 0.8)',
    },
    Table: {
      headerBg: 'rgba(255, 255, 255, 0.15)',
      rowHoverBg: 'rgba(255, 255, 255, 0.1)',
    },
    Card: {
      colorBgContainer: 'rgba(255, 255, 255, 0.1)',
    },
    List: {
      itemHoverBg: 'rgba(255, 255, 255, 0.1)',
    },
  } : {
    Menu: {
      itemBg: themeType === "dark" ? "#000" : "#fff"
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm:
          themeType === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: weatherThemeToken,
        hashed: false,
        components: weatherComponents
      }}
    >
      {children}
    </ConfigProvider>
  );
};
