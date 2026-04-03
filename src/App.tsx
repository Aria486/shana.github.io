import React from "react";
import { Theme, LangWrapper, AppLayout } from "@/components";
import { GlobalDataProvider } from "@/context";
import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import { NoteList, NoteDetail } from "@/components";
import { EditorPage } from "@/components/EditorPage";
import { ROOT_PATH } from "@/utils/constants";
import "./App.css";

const RouteLayout = (content: React.ReactElement) => (
  <AppLayout>{content}</AppLayout>
);

const router = createHashRouter([
  {
    path: "/",
    element: <Navigate replace to={`${ROOT_PATH}/zh-CN`} />
  },
  {
    path: `${ROOT_PATH}/:lang/editor`,
    element: <EditorPage />
  },
  {
    path: `${ROOT_PATH}/:lang`,
    element: <LangWrapper />,
    children: [
      {
        index: true,
        element: RouteLayout(<NoteList />)
      },
      {
        path: "note/*",
        element: RouteLayout(<NoteDetail />)
      }
    ]
  },
  {
    path: "*",
    element: <Navigate replace to={`${ROOT_PATH}/zh-CN`} />
  }
]);

function App() {
  return (
    <GlobalDataProvider>
      <Theme>
        <RouterProvider router={router} />
      </Theme>
    </GlobalDataProvider>
  );
}

export default App;