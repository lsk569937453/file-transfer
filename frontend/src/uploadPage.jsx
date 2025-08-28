import { useState, React, useEffect, useRef } from "react";
import axios from "axios";
import { getBaseUrl } from "./utli/axios.js";

export default function UploadPage() {
  const fileUpload = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [rootPath, setRootPath] = useState("");
  const [percentCompleted, setPercentCompleted] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

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
    setIsOpen(true);
    const { response_code, response_msg } = (
      await axios({
        url: "/upload",
        method: "POST",
        data: bodyFormData,
        headers: { "Content-Type": "multipart/form-data" },
        baseURL: getBaseUrl(),
        onUploadProgress: function (progressEvent) {
          let percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setPercentCompleted(percentCompleted);
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
      <div className="flex flex-col gap-4 p-4">
        <dialog
          id="upload_modal"
          className={`modal ${isOpen ? "modal-open" : ""}`}
        >
          <div className="modal-box">
            <h3 className="font-bold text-lg">Upload Progress</h3>
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

        <div className="flex flex-row">
          <p>Current Root Path:&nbsp;&nbsp;</p>
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
              Select Files
            </button>
          </>
        )}

        {selectedFiles.length !== 0 && (
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Action</th>
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
                Delete All Files
              </button>
              <button
                className="btn btn-primary basis-6/12"
                onClick={handleUploadButtonClick}
              >
                Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
