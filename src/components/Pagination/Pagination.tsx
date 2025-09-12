import React from "react";
import classnames from "classnames";
import { useTranslation } from "react-i18next";
import { useClsAddPrefix } from "@/hooks";
import { ICommonComponent } from "@/interface";
import "./style.scss";

export interface IPagination extends ICommonComponent {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  simple?: boolean;
}

export const Pagination: React.FC<IPagination> = (props) => {
  const {
    className,
    current = 1,
    total = 0,
    pageSize = 10,
    onChange,
    showSizeChanger = true,
    pageSizeOptions = ["10", "20", "50", "100"],
    showQuickJumper = false,
    showTotal,
    simple = false,
  } = props;

  const prefixCls = useClsAddPrefix("pagination");
  const { t } = useTranslation();
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (current - 1) * pageSize + 1;
  const endIndex = Math.min(current * pageSize, total);

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // 最多显示7个页码

    if (totalPages <= maxVisible) {
      // 如果总页数不超过最大显示数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 复杂分页逻辑
      if (current <= 4) {
        // 当前页在前面
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (current >= totalPages - 3) {
        // 当前页在后面
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push(1);
        pages.push("...");
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onChange(page, pageSize);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const newCurrent = Math.min(current, Math.ceil(total / newPageSize));
    onChange(newCurrent, newPageSize);
  };

  const handleQuickJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      const page = parseInt(target.value);
      if (!isNaN(page)) {
        handlePageChange(page);
        target.value = "";
      }
    }
  };

  if (total === 0) {
    return null;
  }

  if (simple) {
    return (
      <div className={classnames(prefixCls, `${prefixCls}-simple`, className)}>
        <button
          className={`${prefixCls}-prev`}
          disabled={current === 1}
          onClick={() => handlePageChange(current - 1)}
        >
          {t("pagination.prev")}
        </button>
        <span className={`${prefixCls}-simple-pager`}>
          {current} / {totalPages}
        </span>
        <button
          className={`${prefixCls}-next`}
          disabled={current === totalPages}
          onClick={() => handlePageChange(current + 1)}
        >
          {t("pagination.next")}
        </button>
      </div>
    );
  }

  return (
    <div className={classnames(prefixCls, className)}>
      {/* 总数显示 */}
      {showTotal && (
        <div className={`${prefixCls}-total`}>
          {showTotal(total, [startIndex, endIndex])}
        </div>
      )}

      {/* 分页器 */}
      <div className={`${prefixCls}-pager`}>
        {/* 上一页 */}
        <button
          data-testid="prev-button"
          className={classnames(`${prefixCls}-prev`, {
            [`${prefixCls}-disabled`]: current === 1,
          })}
          disabled={current === 1}
          onClick={() => handlePageChange(current - 1)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10.5 3.5L6 8l4.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* 页码 */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className={`${prefixCls}-ellipsis`}>•••</span>
            ) : (
              <button
                className={classnames(`${prefixCls}-item`, {
                  [`${prefixCls}-item-active`]: page === current,
                })}
                onClick={() => handlePageChange(page as number)}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* 下一页 */}
        <button
          data-testid="next-button"
          className={classnames(`${prefixCls}-next`, {
            [`${prefixCls}-disabled`]: current === totalPages,
          })}
          disabled={current === totalPages}
          onClick={() => handlePageChange(current + 1)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 3.5L10 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* 页面大小选择器 */}
      {showSizeChanger && (
        <div className={`${prefixCls}-options`}>
          <select
            className={`${prefixCls}-size-changer`}
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} {t("pagination.itemsPerPage")}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 快速跳转 */}
      {showQuickJumper && (
        <div className={`${prefixCls}-quick-jumper`}>
          {t("pagination.jumpTo")}
          <input
            type="number"
            min={1}
            max={totalPages}
            onKeyPress={handleQuickJump}
            placeholder={t("pagination.placeholder")}
          />
          {t("pagination.page")}
        </div>
      )}
    </div>
  );
};