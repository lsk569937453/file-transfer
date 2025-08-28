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
    label: "Computer",
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
    label: "Upload",
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
    label: "Setting",
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
    <div>
      <div role="tablist" className="tabs tabs-boxed">
        {headerdata.map((item) => (
          <Link
            to={item.link}
            key={item.id}
            role="tab"
            className={`tab ${pathname === item.link ? "tab-active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <Routes>
        {router.map((item, index) => (
          <Route path={item.path} element={item.element} key={index} />
        ))}
      </Routes>
    </div>
  );
}

export default App;
