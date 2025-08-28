import { useState, useEffect } from "react";
import axios from "axios";
import { getBaseUrl } from "./utli/axios.js";
// You might need a toast library like 'react-toastify'
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

const data = [
  { disk: "C:\\" },
  { disk: "D:\\" },
  { disk: "E:\\" },
  { disk: "F:\\" },
];

export default function SettingPage() {
  const [inputData, setInputData] = useState("");
  // const notify = () => toast("Set the path successfully");

  const handleUseButtonClick = async (cellValue) => {
    const { response_code, response_msg } = (
      await axios({
        url: "/root_path",
        method: "PUT",
        baseURL: getBaseUrl(),
        data: {
          path: cellValue,
        },
      })
    ).data;
    if (response_code === 0) {
      // notify();
      setTimeout(function () {
        window.location.reload();
      }, 3000);
    }
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
      setInputData(response_msg);
    }
  };

  const handleSetButtonClick = async () => {
    const { response_code, response_msg } = (
      await axios({
        url: "/root_path",
        method: "PUT",
        baseURL: getBaseUrl(),
        data: {
          path: inputData,
        },
      })
    ).data;
    if (response_code === 0) {
      // notify();
    }
  };

  return (
    <>
      {inputData !== "" && (
        <div className="p-4 flex flex-col gap-4">
          <input
            type="text"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="Set the root path"
            className="input input-bordered w-full"
          />
          <button className="btn btn-primary" onClick={handleSetButtonClick}>
            Set Path
          </button>
          {/* <ToastContainer /> */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Disk</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={index}>
                        <td>{item.disk}</td>
                        <td>
                          <button
                            onClick={() => handleUseButtonClick(item.disk)}
                            className="btn btn-primary btn-ghost"
                          >
                            Use the path
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
