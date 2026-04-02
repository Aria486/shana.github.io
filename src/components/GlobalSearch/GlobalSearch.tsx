import React, { useState, useRef, useEffect } from "react";
import classnames from "classnames";
import { useTranslation } from "react-i18next";
import { useClsAddPrefix } from "@/hooks";
import "./style.scss";

export interface IGlobalSearch {
  className?: string;
  placeholder?: string;
  onSearch: (keyword: string) => void;
  /**
   * inline — 始终展开，宽度撑满父容器（用于 Header 中间区）
   * icon   — 收起为图标，点击后展开（默认）
   */
  variant?: "inline" | "icon";
}

export const GlobalSearch: React.FC<IGlobalSearch> = (props) => {
  const {
    className,
    placeholder,
    onSearch,
    variant = "icon",
  } = props;

  const isInline = variant === "inline";

  const prefixCls = useClsAddPrefix("global-search");
  const { t } = useTranslation();
  // inline 模式默认展开，且不会收起
  const [isExpanded, setIsExpanded] = useState(isInline);
  const [keyword, setKeyword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleIconClick = () => {
    setIsExpanded(true);
    // 下一个事件循环中聚焦输入框，确保动画开始后再聚焦
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    onSearch(value);
  };

  const handleClear = () => {
    setKeyword("");
    onSearch("");
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    // inline 模式保持展开；icon 模式无输入时收起
    if (!isInline && !keyword.trim()) {
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setKeyword("");
      onSearch("");
      setIsExpanded(false);
    }
  };

  // 点击外部区域收起搜索框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!keyword.trim()) {
          setIsExpanded(false);
        }
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, keyword]);

  return (
    <div
      ref={containerRef}
      className={classnames(prefixCls, {
        [`${prefixCls}-expanded`]: isExpanded,
        [`${prefixCls}--inline`]: isInline,
      }, className)}
    >
      {!isExpanded ? (
        // 收起状态：只显示搜索图标
        <button
          className={`${prefixCls}-icon-btn`}
          onClick={handleIconClick}
          type="button"
          title={t("search.buttonTitle")}
        >
          <svg
            className={`${prefixCls}-search-icon`}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
        </button>
      ) : (
        // 展开状态：显示完整搜索框
        <div className={`${prefixCls}-input-wrapper`}>
          <svg
            className={`${prefixCls}-search-icon`}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className={`${prefixCls}-input`}
            placeholder={placeholder || t("search.placeholder")}
            value={keyword}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          {keyword && (
            <button
              className={`${prefixCls}-clear`}
              onClick={handleClear}
              type="button"
              title={t("search.clearTitle")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7 0C3.134 0 0 3.134 0 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm3.5 9.5L9.5 10.5 7 8l-2.5 2.5L3.5 9.5 6 7 3.5 4.5 4.5 3.5 7 6l2.5-2.5L10.5 4.5 8 7l2.5 2.5z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};