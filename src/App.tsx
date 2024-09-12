import React from "react";
import { Theme } from "components";
import { GlobalDataProvider } from "context";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { NoteList, NoteDetail } from "components";
import "./App.css";

const rootPath = "shana.github.io"
const router = createBrowserRouter([
  {
    path: "/",
    element: <NoteList />,
  },
  {
    path: rootPath,
    element: <NoteList />,
  },
  {
    path: `${rootPath}/note/*`,
    element: <NoteDetail />,
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
