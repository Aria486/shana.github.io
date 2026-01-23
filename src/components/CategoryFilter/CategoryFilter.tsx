import React from "react";
import { Tag } from "antd";
import { useTranslation } from "react-i18next";
import classnames from "classnames";
import { useClsAddPrefix } from "@/hooks";
import { ICommonComponent } from "@/interface";

import "./style.scss";

export interface ICategoryFilter extends ICommonComponent {
  /** 子分类列表 */
  categories: string[];
  /** 当前选中的子分类，null 表示"全部" */
  selectedCategory: string | null;
  /** 分类变化回调 */
  onChange: (category: string | null) => void;
}

export const CategoryFilter: React.FC<ICategoryFilter> = (props) => {
  const { categories, selectedCategory, onChange, className } = props;
  const prefixCls = useClsAddPrefix("category-filter");
  const { t } = useTranslation();

  // 如果没有子分类，不渲染
  if (categories.length === 0) {
    return null;
  }

  const handleTagClick = (category: string) => {
    // 如果点击的是已选中的标签，取消选择（回到"全部"）
    if (selectedCategory === category) {
      onChange(null);
    } else {
      onChange(category);
    }
  };

  return (
    <div className={classnames(prefixCls, className)}>
      <Tag.CheckableTag
        checked={selectedCategory === null}
        onChange={() => onChange(null)}
      >
        {t("list.all")}
      </Tag.CheckableTag>
      {categories.map((category) => (
        <Tag.CheckableTag
          key={category}
          checked={selectedCategory === category}
          onChange={() => handleTagClick(category)}
        >
          {category}
        </Tag.CheckableTag>
      ))}
    </div>
  );
};
