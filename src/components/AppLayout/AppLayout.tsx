import React, { useState } from "react";
import { BlogLayout, GlobalSearch, Footer } from "@/components";

export interface IAppLayout {
  children: React.ReactNode;
}

export const AppLayout: React.FC<IAppLayout> = ({ children }) => {
  const [globalSearchKeyword, setGlobalSearchKeyword] = useState("");
  const [sortType, setSortType] = useState("timeDesc");

  const handleGlobalSearch = (keyword: string) => {
    setGlobalSearchKeyword(keyword);
  };

  const handleSortChange = (newSortType: string) => {
    setSortType(newSortType);
  };

  // 将排序状态和搜索关键词传递给子组件
  const childrenWithProps = React.Children.map(children, child =>
    React.isValidElement(child) ? React.cloneElement(child, { sortType, globalSearchKeyword } as any) : child
  );

  return (
    <BlogLayout
      header={
        <>
          <GlobalSearch onSearch={handleGlobalSearch} />
        </>
      }
      content={childrenWithProps}
      footer={<Footer />}
      sortType={sortType}
      onSortChange={handleSortChange}
    />
  );
};