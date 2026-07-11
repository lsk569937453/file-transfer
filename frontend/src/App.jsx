import { useState } from "react";
import {
  BrowserRouter,
  useNavigate,
  useLocation,
  Route,
  Routes,
} from "react-router-dom";
import { Link } from "react-router-dom";
import DownloadPage from "./downloadPage";
import UploadPage from "./uploadPage";
import SettingPage from "./settingPage";

const headerdata = [
  {
    id: "Computer",
    label: "下载",
    link: "/downloadPage",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="icon icon-tabler icon-tabler-arrow-narrow-down"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 5l0 14" />
        <path d="M16 15l-4 4" />
        <path d="M8 15l4 4" />
      </svg>
    ),
  },
  {
    id: "Upload",
    label: "上传",
    link: "/uploadPage",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="icon icon-tabler icon-tabler-arrow-narrow-up"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 5l0 14" />
        <path d="M16 9l-4 -4" />
        <path d="M8 9l4 -4" />
      </svg>
    ),
  },
  {
    id: "Setting",
    label: "设置",
    link: "/settingPage",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="icon icon-tabler icon-tabler-arrow-narrow-up"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 5l0 14" />
        <path d="M16 9l-4 -4" />
        <path d="M8 9l4 -4" />
      </svg>
    ),
  },
];
const router = [
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
];

function App() {
  const { pathname } = useLocation();

  return (
    <div className="lg:flex lg:flex-row min-h-screen">
      <nav className="flex flex-row gap-1 p-2 bg-base-200 lg:flex-col lg:w-60 lg:shrink-0 lg:min-h-screen lg:p-4 lg:bg-transparent lg:border-r lg:border-base-300">
        {headerdata.map((item) => (
          <Link
            to={item.link}
            key={item.id}
            className={`flex flex-1 lg:flex-none items-center justify-center lg:justify-start gap-2 px-3 py-2 rounded-lg ${
              pathname === item.link
                ? "bg-primary text-primary-content"
                : "hover:bg-base-300"
            }`}
          >
            <span className="hidden lg:inline-flex">{item.svg}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <main className="flex-1 min-w-0">
        <Routes>
          {router.map((item, index) => (
            <Route path={item.path} element={item.element} key={index} />
          ))}
        </Routes>
      </main>
    </div>
  );
}

export default App;
