import { useState, React, useEffect, useRef } from "react";
import axios from "axios";
import { getBaseUrl } from "./utli/axios.js";
import { formatBytes } from "./utli/format.js";

export default function UploadPage() {
  const fileUpload = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [rootPath, setRootPath] = useState("");
  const [percentCompleted, setPercentCompleted] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadLoaded, setUploadLoaded] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const lastUploadProgressRef = useRef({ loaded: 0, time: 0 });

  const handleUpload = () => {
    fileUpload.current.click();
  };

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    const { response_code, response_msg } = (
      await axios({
        url: "/rootPath",
        method: "GET",
        baseURL: getBaseUrl(),
      })
    ).data;
    if (response_code === 0) {
      setRootPath(response_msg);
    }
  };

  const uploadProfilePic = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleDeleteOneFileButtonClick = (index) => {
    const newSelectedFiles = [...selectedFiles];
    newSelectedFiles.splice(index, 1);
    setSelectedFiles(newSelectedFiles);
  };

  const handleDeleAllFilesButtonClick = () => {
    setSelectedFiles([]);
  };

  const handleUploadButtonClick = async () => {
    var bodyFormData = new FormData();
    selectedFiles.map((item) => {
      bodyFormData.append("file", item);
    });
    setUploadLoaded(0);
    setUploadTotal(0);
    setUploadSpeed(0);
    setPercentCompleted(0);
    lastUploadProgressRef.current = { loaded: 0, time: 0 };
    setIsOpen(true);
    const { response_code, response_msg } = (
      await axios({
        url: "/upload",
        method: "POST",
        data: bodyFormData,
        headers: { "Content-Type": "multipart/form-data" },
        baseURL: getBaseUrl(),
        onUploadProgress: (progressEvent) => {
          const { loaded, total, timeStamp } = progressEvent;
          const last = lastUploadProgressRef.current;
          let speed = 0;
          if (last.time && timeStamp > last.time) {
            const dt = (timeStamp - last.time) / 1000;
            if (dt > 0) speed = (loaded - last.loaded) / dt;
          }
          lastUploadProgressRef.current = { loaded, time: timeStamp };
          setPercentCompleted(total ? Math.round((loaded * 100) / total) : 0);
          setUploadLoaded(loaded);
          setUploadTotal(total);
          setUploadSpeed(speed);
        },
      })
    ).data;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsOpen(false);
    setPercentCompleted(0);
    if (response_code === 0) {
      // Handle success
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 p-4 lg:max-w-3xl lg:mx-auto">
        <dialog
          id="upload_modal"
          className={`modal ${isOpen ? "modal-open" : ""}`}
        >
          <div className="modal-box">
            <h3 className="font-bold text-lg">上传中</h3>
            <p className="text-sm opacity-70 break-all mb-4">
              {selectedFiles.length} 个文件 ·{" "}
              {formatBytes(
                uploadTotal ||
                  selectedFiles.reduce((s, f) => s + (f.size || 0), 0)
              )}
            </p>
            <div className="flex flex-col gap-2 py-2">
              <div className="flex flex-row items-center justify-between">
                <span className="text-2xl font-bold tabular-nums">
                  {percentCompleted}
                  {"%"}
                </span>
                <span className="text-sm opacity-60 tabular-nums">
                  {uploadTotal
                    ? `${formatBytes(uploadLoaded)} / ${formatBytes(uploadTotal)}`
                    : formatBytes(uploadLoaded)}
                </span>
              </div>
              <progress
                className="progress progress-primary w-full"
                value={percentCompleted}
                max="100"
              ></progress>
              <div className="flex flex-row items-center justify-end text-sm opacity-60">
                <span className="tabular-nums">
                  {uploadSpeed > 0 ? `${formatBytes(uploadSpeed)}/s` : ""}
                </span>
              </div>
            </div>
          </div>
        </dialog>

        <div className="flex flex-row">
          <p>当前根目录：</p>
          <p className="font-bold text-red-500">{rootPath}</p>
        </div>

        {selectedFiles.length === 0 && (
          <>
            <input
              type="file"
              ref={fileUpload}
              onChange={uploadProfilePic}
              multiple
              style={{ opacity: "0", display: "none" }}
            />
            <button onClick={handleUpload} className="btn btn-primary">
              选择文件
            </button>
          </>
        )}

        {selectedFiles.length !== 0 && (
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>名称</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFiles.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteOneFileButtonClick(index)}
                          className="btn btn-ghost btn-xs"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-row gap-4">
              <button
                className="btn btn-error basis-6/12"
                onClick={handleDeleAllFilesButtonClick}
              >
                删除全部
              </button>
              <button
                className="btn btn-primary basis-6/12"
                onClick={handleUploadButtonClick}
              >
                上传
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
