import React, { useState, useMemo, useEffect } from "react";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import { BlogLayout, GlobalSearch, Footer, CategoryFilter } from "@/components";
import { useIsMobile } from "@/hooks";
import { useGlobalData } from "@/context";
import { extractSubcategories } from "@/utils/helper";
import { DirectoryNode } from "@/interface";
import directoryStructureData from "@/utils/note-directory-structure.json";

import "./style.scss";

const directoryStructure = directoryStructureData as DirectoryNode[];

export interface IAppLayout {
  children: React.ReactNode;
}

export const AppLayout: React.FC<IAppLayout> = ({ children }) => {
  const { t } = useTranslation();
  const { globalData, update } = useGlobalData();
  const menu = globalData.menu as string;
  const isMobile = useIsMobile();

  const [globalSearchKeyword, setGlobalSearchKeyword] = useState("");
  const [sortType, setSortType] = useState("timeDesc");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // 切换大分类时重置子分类选择
  useEffect(() => {
    setSelectedSubcategory(null);
  }, [menu]);

  // 当前大分类的子分类列表
  const subcategories = useMemo(
    () => extractSubcategories(menu, directoryStructure),
    [menu]
  );

  const navItems = [
    { label: t("menu.program"), key: "program" },
    { label: t("menu.tool"), key: "tool" },
    { label: t("menu.study_note"), key: "study_note" },
    { label: t("menu.history"), key: "history" },
    { label: t("menu.game"), key: "game" },
    { label: t("menu.novel"), key: "novel" },
    { label: t("menu.religion"), key: "religion" },
  ];

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    update("menu", e.key);
  };

  // 移动端侧边栏：垂直导航菜单 + 子分类过滤
  const mobileSider = isMobile ? (
    <div className="shana-blog-app-layout-sider">
      <Menu
        mode="inline"
        selectedKeys={[menu]}
        items={navItems}
        onClick={handleMenuClick}
        className="shana-blog-app-layout-sider-menu"
      />
      {subcategories.length > 0 && (
        <CategoryFilter
          categories={subcategories}
          selectedCategory={selectedSubcategory}
          onChange={setSelectedSubcategory}
          className="shana-blog-app-layout-sider-category"
        />
      )}
    </div>
  ) : undefined;

  // 将状态传递给子组件；移动端额外传递受控子分类
  const childrenWithProps = React.Children.map(children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child, {
        sortType,
        globalSearchKeyword,
        ...(isMobile
          ? { selectedSubcategory, onSubcategoryChange: setSelectedSubcategory }
          : {}),
      } as Record<string, unknown>)
      : child
  );

  return (
    <BlogLayout
      sider={mobileSider}
      header={<GlobalSearch onSearch={setGlobalSearchKeyword} variant="inline" />}
      content={childrenWithProps}
      footer={<Footer />}
      sortType={sortType}
      onSortChange={setSortType}
    />
  );
};