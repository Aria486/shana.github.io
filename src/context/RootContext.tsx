import React, { createContext, useReducer, useContext, ReactNode } from "react";

// 状态类型定义
interface GlobalData {
  [key: string]: any;
}

// 操作类型定义
type Action =
  | { type: "REMOVE"; key: string }
  | { type: "UPDATE"; key: string; value: any }
  | { type: "FETCH" };

// 初始状态
const initialData: GlobalData = {
  themeType: "light",
  menu: "program",
};

// reducer 函数
const reducer = (state: GlobalData, action: Action): GlobalData => {
  switch (action.type) {
    case "REMOVE":
      // eslint-disable-next-line no-case-declarations
      const newData = { ...state };
      delete newData[action.key];
      return { ...newData };
    case "UPDATE":
      return { ...state, [action.key]: action.value };
    case "FETCH":
      return state;
    default:
      return state;
  }
};

// Context 和 Provider 类型定义
interface DataContextProps {
  globalData: GlobalData;
  remove: (key: string) => void;
  update: (key: string, value: any) => void;
  fetch: () => void;
}

// 创建 Context
const DataContext = createContext<DataContextProps | undefined>(undefined);

// Context Provider 组件
export const GlobalDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [globalData, dispatch] = useReducer(reducer, initialData);

  const remove = (key: string) => dispatch({ type: "REMOVE", key });
  const update = (key: string, value: any) =>
    dispatch({ type: "UPDATE", key, value });
  const fetch = () => dispatch({ type: "FETCH" });

  return (
    <DataContext.Provider value={{ globalData, remove, update, fetch }}>
      {children}
    </DataContext.Provider>
  );
};

// 使用 Context 的 hook
export const useGlobalData = (): DataContextProps => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
