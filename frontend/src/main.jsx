import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { NextUIProvider } from '@nextui-org/react'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import DownloadPage from "./downloadPage.jsx";
import UploadPage from './uploadPage.jsx'
import SettingPage from './settingPage.jsx'
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <DownloadPage />,
      },
      {
        path: "/downloadPage",
        element: <DownloadPage />,
      },
      {
        path: "/uploadPage",
        element: <UploadPage />,
      },
      {
        path: "/settingPage",
        element: <SettingPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>

      <RouterProvider router={router} />

  </React.StrictMode>,
)
