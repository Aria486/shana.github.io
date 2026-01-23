import React, { useState } from "react";
import classnames from "classnames";
import { Button, Menu, MenuProps, Typography, Select } from "antd";
import { ArrowLeftOutlined, CloudOutlined } from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useClsAddPrefix } from "@/hooks";
import { ICommonComponent } from "@/interface";
import { useGlobalData } from "@/context";
import { ROOT_PATH } from "@/utils/constants";
import { removeFileExtension } from "@/utils/helper";
import { WeatherSettings } from "@/components/WeatherSettings";

import "./style.scss";

const { Title } = Typography;
export interface IHeader extends ICommonComponent {
  reactNode?: React.ReactNode;
  showSort?: boolean;
  sortType?: string;
  onSortChange?: (sortType: string) => void;
}

type MenuItem = Required<MenuProps>["items"][number];

export const Header: React.FC<IHeader> = (props) => {
  const { reactNode, className, showSort = false, sortType = "time", onSortChange } = props;
  const prefixCls = useClsAddPrefix("header");
  const { globalData, update } = useGlobalData();
  const { menu } = globalData;
  const { pathname } = useLocation();
  const nav = useNavigate();
  const urlParams = useParams();
  const lang = urlParams.lang;
  const { t } = useTranslation();
  const isHome = `${ROOT_PATH}${lang}` === pathname.replace(/\//g, "");

  const [weatherSettingsOpen, setWeatherSettingsOpen] = useState(false);

  const items: MenuItem[] = [
    {
      label: t("menu.program"),
      key: "program"
    },
    {
      label: t("menu.tool"),
      key: "tool"
    },
    {
      label: t("menu.study_note"),
      key: "study_note"
    },
    {
      label: t("menu.history"),
      key: "history"
    },
    {
      label: t("menu.game"),
      key: "game"
    },
    {
      label: t("menu.novel"),
      key: "novel"
    },
    {
      label: t("menu.religion"),
      key: "religion"
    }
  ];


  const sortOptions = [
    { label: t("sort.name"), value: "name" },
    { label: t("sort.time"), value: "time" },
    { label: t("sort.timeDesc"), value: "timeDesc" },
  ];


  const getDetailTitle = (path: string) => {
    const fileName = decodeURI(path).split("/").at(-1) || '';
    return removeFileExtension(fileName);
  };

  const onClick: MenuProps["onClick"] = (e) => {
    update("menu", e.key);
  };

  const handleBack = () => {
    // 检查来源是否是站内
    const referrer = document.referrer;
    const isSameSite = referrer && referrer.includes(window.location.hostname);

    if (isSameSite) {
      nav(-1);  // 来自站内,返回上一页
    } else {
      nav(`/${lang}`);  // 来自站外或直接访问,回到首页
    }
  };

  return (
    <div className={classnames(prefixCls, className)}>
      <div className={`${prefixCls}-content`}>
        {isHome ? (
          <Menu
            className={`${prefixCls}-menu`}
            onClick={onClick}
            selectedKeys={[menu]}
            mode="horizontal"
            items={items}
          />
        ) : (
          <div className={`${prefixCls}-return`}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              shape="circle"
              onClick={handleBack}
            />
            <Title className={`${prefixCls}-return-title`} level={4}>
              {getDetailTitle(pathname)}
            </Title>
          </div>
        )}

        <div className={`${prefixCls}-actions`}>
          {showSort && reactNode}
          {showSort && onSortChange && (
            <Select
              value={sortType}
              onChange={onSortChange}
              options={sortOptions}
              style={{ width: 120, marginRight: 8 }}
              size="small"
            />
          )}
          <Button
            type="text"
            icon={<CloudOutlined />}
            onClick={() => setWeatherSettingsOpen(true)}
            title={t('weatherSettings.title')}
          />
        </div>
      </div>

      <WeatherSettings
        open={weatherSettingsOpen}
        onClose={() => setWeatherSettingsOpen(false)}
      />
    </div>
  );
};
