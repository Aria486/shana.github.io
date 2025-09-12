import React, { useState, useMemo } from "react";
import classnames from "classnames";
import { Avatar, List } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useClsAddPrefix } from "@/hooks";
import { ICommonComponent } from "@/interface";
import { useGlobalData } from "@/context";
import { allPaths } from "@/route";
import { Pagination } from "@/components";

import "./style.scss";

export interface INoteList extends ICommonComponent {
  reactNode?: React.ReactNode;
  pageSize?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  globalSearchKeyword?: string;
  sortType?: string;
}

export const NoteList: React.FC<INoteList> = (props) => {
  const {
    className,
    pageSize: defaultPageSize = 5,
    showSizeChanger = true,
    showQuickJumper = false,
    globalSearchKeyword = "",
    sortType = "time"
  } = props;

  const prefixCls = useClsAddPrefix("note-list");
  const { globalData } = useGlobalData();
  const nav = useNavigate();
  const { menu } = globalData;
  const { t } = useTranslation();

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const getTag = (path: string) => {
    const pathArr = path.split("/");
    return pathArr.at(-1)?.substring(0, 4);
  };

  // 获取当前菜单的所有数据
  const rawData = useMemo(() => {
    return allPaths[menu]?.map((item) => ({
      ...item,
      title: item.name
    })) || [];
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

    // 排序
    result.sort((a, b) => {
      console.log('Sorting:', sortType, new Date(a.lastModifiedISO).getTime());
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
  }, [rawData, globalSearchKeyword, sortType]);

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


  // 重置状态当菜单改变时或全局搜索关键词改变时或排序类型改变时
  React.useEffect(() => {
    setCurrentPage(1);
  }, [menu, globalSearchKeyword, sortType]);

  return (
    <div className={classnames(prefixCls, className)}>
      {/* 列表内容 */}
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

      {/* 分页器 */}
      {filteredAndSortedData.length > pageSize && (
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
      )}
    </div>
  );
};
