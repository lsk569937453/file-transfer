import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";
import { getBaseUrl } from "./utli/axios.js";
import { formatBytes } from "./utli/format.js";

export default function DownloadPage() {
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const [percentCompleted, setPercentCompleted] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [downloadFileName, setDownloadFileName] = useState("");
  const [downloadLoaded, setDownloadLoaded] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const lastProgressRef = useRef({ loaded: 0, time: 0 });
  const abortControllerRef = useRef(null);

  const location = useLocation();

  const [data, setData] = useState([]);

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    loadPage();
  }, [location]);

  const loadPage = async () => {
    let finalPath = "";
    let path = searchParams.get("path");
    if (path) {
      finalPath = "?path=" + path;
    }
    const { response_code, response_msg } = (
      await axios({
        url: "/path" + finalPath,
        method: "GET",
        baseURL: getBaseUrl(),
      })
    ).data;

    if (response_code === 0) {
      const final = response_msg.sort((a, b) => (a.is_dir > b.is_dir ? -1 : 1));
      setData(final);
    }
  };

  const handleDownloadClick = async (pathname, isDir) => {
    if (isDir) {
      const path =
        searchParams.get("path") === null
          ? pathname
          : searchParams.get("path") + "," + pathname;
      navigate("/downloadPage?path=" + path);
    } else {
      const path =
        searchParams.get("path") === null
          ? pathname
          : searchParams.get("path") + "," + pathname;
      const downloadPath = "/download?path=" + path;
      setDownloadFileName(pathname);
      setDownloadLoaded(0);
      setDownloadTotal(0);
      setDownloadSpeed(0);
      setPercentCompleted(0);
      lastProgressRef.current = { loaded: 0, time: 0 };
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsOpen(true);
      try {
        let response = await axios({
          url: downloadPath,
          baseURL: getBaseUrl(),
          method: "GET",
          responseType: "blob",
          signal: controller.signal,
          onDownloadProgress: (progressEvent) => {
            const { loaded, total, timeStamp } = progressEvent;
            const last = lastProgressRef.current;
            let speed = 0;
            if (last.time && timeStamp > last.time) {
              const dt = (timeStamp - last.time) / 1000;
              if (dt > 0) speed = (loaded - last.loaded) / dt;
            }
            lastProgressRef.current = { loaded, time: timeStamp };
            setPercentCompleted(total ? Math.round((loaded * 100) / total) : 0);
            setDownloadLoaded(loaded);
            setDownloadTotal(total);
            setDownloadSpeed(speed);
          },
        });
        const href = URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = href;
        link.setAttribute("download", pathname);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        // 用户取消或请求失败，跳过保存
      } finally {
        setIsOpen(false);
        setPercentCompleted(0);
        setDownloadFileName("");
        abortControllerRef.current = null;
      }
    }
  };

  const handleReturnButtonClick = () => {
    const pathArray = searchParams.get("path").split(",");
    if (pathArray.length === 1) {
      navigate("/downloadPage");
    } else {
      pathArray.pop();
      const path = pathArray.join(",");
      navigate("/downloadPage?path=" + path);
    }
  };

  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="flex flex-col overflow-auto p-5">
      <dialog
        id="download_modal"
        className={`modal ${isOpen ? "modal-open" : ""}`}
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg">下载中</h3>
          {downloadFileName && (
            <p className="text-sm opacity-70 break-all mb-4">
              {downloadFileName}
            </p>
          )}
          <div className="flex flex-col gap-2 py-2">
            <div className="flex flex-row items-center justify-between">
              <span className="text-2xl font-bold tabular-nums">
                {percentCompleted}
                {"%"}
              </span>
              <span className="text-sm opacity-60 tabular-nums">
                {downloadTotal
                  ? `${formatBytes(downloadLoaded)} / ${formatBytes(downloadTotal)}`
                  : formatBytes(downloadLoaded)}
              </span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={percentCompleted}
              max="100"
            ></progress>
            <div className="flex flex-row items-center justify-end text-sm opacity-60">
              <span className="tabular-nums">
                {downloadSpeed > 0 ? `${formatBytes(downloadSpeed)}/s` : ""}
              </span>
            </div>
          </div>
          <div className="modal-action">
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleCancelDownload}
            >
              取消
            </button>
          </div>
        </div>
      </dialog>

      {searchParams.get("path") && (
        <div
          className="flex flex-row items-center gap-2 mb-4 cursor-pointer w-fit hover:text-primary"
          onClick={handleReturnButtonClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M9 14l-4 -4l4 -4" />
            <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
          </svg>
          <span className="font-bold">返回上一级</span>
        </div>
      )}

      {/* H5：图标行列表（小屏显示） */}
      <div className="lg:hidden">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex flex-row cursor-pointer items-center"
            onClick={() => handleDownloadClick(item.file_name, item.is_dir)}
          >
            <div className="basis-2/12">
              {item.is_dir ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-folder"
                  width="72"
                  height="72"
                  viewBox="0 0 24 24"
                  strokeWidth="1"
                  stroke="currentColor"
                  fill="rgb(255,230,142)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-file"
                  width="72"
                  height="72"
                  viewBox="0 0 24 24"
                  strokeWidth="1"
                  stroke="currentColor"
                  fill="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                </svg>
              )}
            </div>
            <div className="basis-10/12 flex flex-col gap-4">
              <div className="basis-2/12 font-bold text-xl">
                {item.file_name.length < 20
                  ? item.file_name
                  : item.file_name.slice(0, 20) + "..."}
              </div>
              <div className="basis-10/12 flex flex-row">
                {!item.is_dir && (
                  <>
                    <div className="basis-4/12">{item.size}</div>
                    <div className="basis-8/12">{item.update_time}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PC：表格（大屏显示） */}
      <div className="hidden lg:block p-5">
        <table className="table">
          <thead>
            <tr>
              <th>名称</th>
              <th>大小</th>
              <th>修改时间</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="cursor-pointer hover"
                onClick={() => handleDownloadClick(item.file_name, item.is_dir)}
              >
                <td>
                  <div className="flex items-center gap-2">
                    {item.is_dir ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        strokeWidth="1"
                        stroke="currentColor"
                        fill="rgb(255,230,142)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        strokeWidth="1"
                        stroke="currentColor"
                        fill="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                      </svg>
                    )}
                    <span className="truncate">{item.file_name}</span>
                  </div>
                </td>
                <td>{item.is_dir ? "—" : item.size}</td>
                <td>{item.is_dir ? "—" : item.update_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
