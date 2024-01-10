import React from 'react'
import {BrowserRouter, useNavigate} from 'react-router-dom';
import ReactDOM  from 'react-dom/client'
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

// const router = createHashRouter([
//   {
//     path: "/",
//     element: <DownloadPage />,
//   },
//   {
//     path: "/downloadPage",
//     element: <DownloadPage />,
//   },
//   {
//     path: "/uploadPage",
//     element: <UploadPage />,
//   },
//   {
//     path: "/settingPage",
//     element: <SettingPage />,
//   },
// ]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
