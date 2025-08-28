import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";
import { getBaseUrl } from "./utli/axios.js";

export default function DownloadPage() {
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const [percentCompleted, setPercentCompleted] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

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
      setIsOpen(true);
      let response = await axios({
        url: downloadPath,
        baseURL: getBaseUrl(),
        method: "GET",
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setPercentCompleted(percentCompleted);
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
      setIsOpen(false);
      setPercentCompleted(0);
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

  return (
    <div className="flex flex-col overflow-auto p-5">
      <dialog
        id="download_modal"
        className={`modal ${isOpen ? "modal-open" : ""}`}
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg">Download Progress</h3>
          <div className="flex flex-row py-4 gap-3 justify-center items-center">
            <progress
              className="progress progress-primary w-56"
              value={percentCompleted}
              max="100"
            ></progress>
            <p>
              {percentCompleted}
              {"%"}
            </p>
          </div>
        </div>
      </dialog>

      {searchParams.get("path") && (
        <div
          className="flex flex-row items-center mb-4 cursor-pointer"
          onClick={handleReturnButtonClick}
        >
          <div className="basis-2/12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon icon-tabler icon-tabler-arrow-back-up"
              width="72"
              height="72"
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
          </div>
          <div className="basis-10/12">
            <div className="font-bold text-xl">Return To Previous Dir</div>
          </div>
        </div>
      )}

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
  );
}
