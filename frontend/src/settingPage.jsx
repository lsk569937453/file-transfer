import { useState, useRef, useEffect } from 'react'

import { Button, Input, Card } from "@nextui-org/react";
import { Outlet } from "react-router-dom";
import { getBaseUrl } from './utli/axios.js'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from "@nextui-org/react";
import { Link } from "@nextui-org/react";

import 'react-toastify/dist/ReactToastify.css';
const columns = [
  {
    key: "disk",
    label: "Disk",
  },
  {
    key: "action",
    label: "Action",
  },

];
const data = [{
  disk: "C:\\"
}, {
  disk: "D:\\"
}, {
  disk: "E:\\"
}, {
  disk: "F:\\"
}]


export default function SettingPage() {
  const [inputData, setInputData] = useState("");
  const notify = () => toast("Set the path successfully");
  const handleUseButtonClick = async (cellValue) => {
    const { response_code, response_msg } = (await axios({
      url: "/root_path", method: 'PUT',
      baseURL: getBaseUrl(),
      data: {
        path: cellValue
      }
    })).data;
    console.log(response_code);
    console.log(response_msg);
    if (response_code == 0) {
      notify();
      setTimeout(function () {
        window.location.reload();
      }, 3000);
    }
  }
  useEffect(() => {
    loadPage();
  }, []);
  const renderCell = (item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "disk":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );
      case "action":
        return (
          <div className="relative flex items-center gap-2">

            <Button onClick={() => handleUseButtonClick(item.disk)} color='primary' variant="ghost">Use the path</Button>

          </div>
        );
      default:
        return "cellValue";
    }
  };
  const loadPage = async () => {
    const { response_code, response_msg } = (await axios({
      url: "/rootPath", method: 'GET',
      baseURL: getBaseUrl()
    })).data;
    console.log(response_code);
    console.log(response_msg);
    if (response_code == 0) {
      setInputData(response_msg)
    }
  }
  const handleSetButtonClick = async () => {
    const { response_code, response_msg } = (await axios({
      url: "/root_path", method: 'PUT',
      baseURL: getBaseUrl(),
      data: {
        path: inputData
      }
    })).data;
    console.log(response_code);
    console.log(response_msg);
    if (response_code == 0) {
      notify();
    }

  }
  return (
    <>
      {inputData !== "" &&
        <div className="p-4 flex flex-col gap-4">
          <Input value={inputData} onChange={(e) => setInputData(e.target.value)} placeholder='Set the root path'></Input>
          <Button color="primary" onClick={handleSetButtonClick}>Set Path</Button>
          <ToastContainer />
          <Card>
            <Table aria-label="Example table with dynamic content">
              <TableHeader columns={columns}>
                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
              </TableHeader>
              <TableBody >
                {data.map((item, index) => (
                  <TableRow key={index}>
                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      }
    </>

  )
}

