import React, { useState, useMemo } from "react";
import classnames from "classnames";
import { Avatar, List } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useClsAddPrefix } from "@/hooks";
import { ICommonComponent, DirectoryNode } from "@/interface";
import { useGlobalData } from "@/context";
import { allPaths } from "@/route";
import { Pagination, CategoryFilter } from "@/components";
import { removeFileExtension, extractSubcategories } from "@/utils/helper";
import directoryStructureData from "@/utils/note-directory-structure.json";

import "./style.scss";

const directoryStructure = directoryStructureData as DirectoryNode[];

export interface INoteList extends ICommonComponent {
  reactNode?: React.ReactNode;
  pageSize?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  globalSearchKeyword?: string;
  sortType?: string;
  /**
   * 由父组件（AppLayout）控制的子分类，移动端 Drawer 中使用。
   * 提供此 prop 时 NoteList 不渲染内联 CategoryFilter。
   */
  selectedSubcategory?: string | null;
  /** 子分类变化回调，与 selectedSubcategory 配对使用 */
  onSubcategoryChange?: (category: string | null) => void;
}

export const NoteList: React.FC<INoteList> = (props) => {
  const {
    className,
    pageSize: defaultPageSize = 10,
    showSizeChanger = true,
    showQuickJumper = false,
    globalSearchKeyword = "",
    sortType = "time",
    selectedSubcategory: externalSelectedSubcategory,
    onSubcategoryChange,
  } = props;

  // 是否由父组件受控（移动端模式）
  const isControlled = onSubcategoryChange !== undefined;

  const prefixCls = useClsAddPrefix("note-list");
  const { globalData } = useGlobalData();
  const nav = useNavigate();
  const { menu } = globalData;
  const { t } = useTranslation();

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // 子分类过滤状态（非受控模式，桌面端使用）
  const [internalSelectedSubcategory, setInternalSelectedSubcategory] = useState<string | null>(null);

  // 受控模式用外部值，否则用内部值
  const selectedSubcategory = isControlled
    ? (externalSelectedSubcategory ?? null)
    : internalSelectedSubcategory;

  // 切换子分类时重置分页
  const handleCategoryChange = (category: string | null) => {
    setCurrentPage(1);
    if (isControlled) {
      onSubcategoryChange!(category);
    } else {
      setInternalSelectedSubcategory(category);
    }
  };

  const getTag = (path: string) => {
    const pathArr = path.split("/");
    return pathArr.at(-1)?.substring(0, 4);
  };

  // 获取当前菜单的所有数据
  const rawData = useMemo(() => {
    return allPaths[menu]?.map((item) => ({
      ...item,
      title: removeFileExtension(item.name)
    })) || [];
  }, [menu]);

  // 提取当前大分类的子分类列表
  const subcategories = useMemo(() => {
    return extractSubcategories(menu, directoryStructure);
  }, [menu]);

  // 过滤和排序数据
  const filteredAndSortedData = useMemo(() => {
    let result = [...rawData];

    // 全局搜索过滤
    if (globalSearchKeyword.trim()) {
      const keyword = globalSearchKeyword.toLowerCase();
      result = result.filter((item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.path.toLowerCase().includes(keyword)
      );
    }

    // 子分类过滤
    if (selectedSubcategory) {
      result = result.filter((item) => {
        const pathParts = item.path.split("/");
        // 笔记路径格式: category/subcategory/filename.md 或 category/filename.md
        // pathParts[0] 是大分类, pathParts[1] 是子分类（如果存在）
        return pathParts[1] && pathParts[1] === selectedSubcategory;
      });
    }

    // 排序
    result.sort((a, b) => {
      switch (sortType) {
        case "name":
          return a.title.localeCompare(b.title, 'zh-CN');
        case "time":
          return new Date(a.lastModifiedISO).getTime() - new Date(b.lastModifiedISO).getTime();
        case "timeDesc":
          return new Date(b.lastModifiedISO).getTime() - new Date(a.lastModifiedISO).getTime();
        default:
          return 0;
      }
    });


    return result;
  }, [rawData, globalSearchKeyword, selectedSubcategory, sortType]);

  // 计算分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, pageSize]);

  // 处理分页变化
  const handlePageChange = (page: number, newPageSize: number) => {
    setCurrentPage(page);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
  };

  // 重置状态当菜单改变时或全局搜索关键词改变时
  React.useEffect(() => {
    setCurrentPage(1);
    // 非受控模式才重置内部子分类；受控模式由父组件（AppLayout）负责重置
    if (!isControlled) {
      setInternalSelectedSubcategory(null);
    }
  }, [menu, globalSearchKeyword, isControlled]);

  // 排序类型改变时只重置分页，不重置子分类过滤
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortType]);

  return (
    <div className={classnames(prefixCls, className)}>
      {/* 子分类过滤标签栏：非受控模式（桌面端）才内联渲染 */}
      {!isControlled && (
        <CategoryFilter
          categories={subcategories}
          selectedCategory={selectedSubcategory}
          onChange={handleCategoryChange}
        />
      )}

      {/* 列表内容 - 可滚动区域 */}
      <div className={`${prefixCls}-scroll-container`}>
        <List
          className={`${prefixCls}-content`}
          dataSource={paginatedData}
          renderItem={(item) => (
            <List.Item
              className={`${prefixCls}-item`}
              onClick={() => nav(`note/${item.path}`)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar size={40} style={{ background: item?.bgColor }}>
                    {getTag(item.path)}
                  </Avatar>
                }
                title={item.title}
                description={item.lastModified}
              />
            </List.Item>
          )}
          locale={{
            emptyText: globalSearchKeyword ?
              t("list.searchEmptyText", { keyword: globalSearchKeyword }) :
              t("list.emptyText")
          }}
        />
      </div>

      {/* 分页器 - 固定在底部 */}
      {filteredAndSortedData.length > pageSize && (
        <div className={`${prefixCls}-pagination-fixed`}>
          <Pagination
            current={currentPage}
            total={filteredAndSortedData.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={showSizeChanger}
            showQuickJumper={showQuickJumper}
            showTotal={(total, range) => {
              if (globalSearchKeyword) {
                return t("pagination.searchResult", {
                  keyword: globalSearchKeyword,
                  total,
                  start: range[0],
                  end: range[1]
                });
              }
              return t("pagination.total", {
                total,
                start: range[0],
                end: range[1]
              });
            }}
            pageSizeOptions={["5", "10", "20", "50"]}
          />
        </div>
      )}
    </div>
  );
};
