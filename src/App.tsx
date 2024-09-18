import React from "react";
import { BlogLayout, Theme, ThemeSwitch } from "components";
import { GlobalDataProvider } from "context";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { NoteList, NoteDetail, Summer } from "components";
import { ROOT_PATH } from "utils/constants";
import "./App.css";

const RouteLayout = (content: React.ReactNode) => (
  <BlogLayout header={<ThemeSwitch />} content={content} footer="© 2024" />
);

const router = createBrowserRouter([
  {
    path: "/",
    element: RouteLayout(<NoteList />),
  },
  {
    path: ROOT_PATH,
    element: RouteLayout(<NoteList />),
  },
  {
    path: `${ROOT_PATH}/note/*`,
    element: RouteLayout(<NoteDetail />),
  },
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
