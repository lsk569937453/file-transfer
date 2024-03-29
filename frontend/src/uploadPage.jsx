import { useState, React, useEffect } from 'react'
import { useRef } from "react";

import { Button } from "@nextui-org/react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem
} from "@nextui-org/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Progress } from "@nextui-org/react";

import { Link } from "@nextui-org/react";
import { Outlet } from "react-router-dom";
import axios from 'axios'
import { getBaseUrl } from './utli/axios.js'

const columns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "action",
    label: "Action",
  },

];
export default function UploadPage() {
  const fileUpload = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [rootPath, setRootPath] = useState("");
  const [percentCompleted, setPercentCompleted] = useState(60);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();


  const handleUpload = () => {
    fileUpload.current.click();
  };
  useEffect(() => {
    loadPage();
  }, []);
  const loadPage = async () => {
    const { response_code, response_msg } = (await axios({
      url: "/rootPath", method: 'GET',
      baseURL: getBaseUrl()
    })).data;
    console.log(response_code);
    console.log(response_msg);
    if (response_code == 0) {
      setRootPath(response_msg)
    }
  }
  const uploadProfilePic = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    console.log(files)
  };

  const renderCell = (item,index, columnKey) => {
    const cellValue = item[columnKey];
    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );
      case "action":
        return (
          <div className="relative flex items-center gap-2">

            <Link isBlock showAnchorIcon onClick={() => handleDeleteOneFileButtonClick(index)} color="red"
              anchorIcon={<svg xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-x" width="18" height="18" viewBox="0 0 24 24"
                strokeWidth="2" stroke="red" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" />
                <path d="M6 6l12 12" /></svg>
              } >
            </Link>

          </div>
        );
      default:
        return "cellValue";
    }
  };
  const handleDeleAllFilesButtonClick = () => {
    setSelectedFiles([]);
  }
  const handleDeleteOneFileButtonClick = (index) => {
    const newSelectedFiles = [...selectedFiles];
    newSelectedFiles.splice(index, 1);
    setSelectedFiles(newSelectedFiles);
  }
  const handleUploadButtonClick = async () => {
    var bodyFormData = new FormData();
    selectedFiles.map((item, index) => {
      bodyFormData.append("file", item);
    });
    onOpen();
    const { response_code, response_msg } = (await axios({
      url: "/upload", method: 'POST',
      data: bodyFormData,
      headers: { "Content-Type": "multipart/form-data" },
      baseURL: getBaseUrl(),
      onUploadProgress: function (progressEvent) {
        console.log(progressEvent);

        let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(percentCompleted);
        setPercentCompleted(percentCompleted);
      }
    })).data;
    console.log(response_code);
    console.log(response_msg);
    await new Promise(resolve => setTimeout(resolve, 1000));

    onClose();
    setPercentCompleted(0);

    if (response_code == 0) {
    }
  }
  return (
    <>
      <div className='flex flex-col gap-4 p-4'>
        <Modal isOpen={isOpen} placement="center" backdrop='blur' onClose={onClose}>
          <ModalContent>
            {/* <div className='flex flex-row'>
              <Progress aria-label="Loading..." value={percentCompleted} className="max-w-md h-full" />
              <p>{percentCompleted}{'%'}</p>
            </div> */}
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Upload Progress</ModalHeader>
                <ModalBody>
                  <div className='flex flex-row py-4 gap-3 justify-center items-center'>
                    <Progress aria-label="Loading..." value={percentCompleted} className="max-w-md h-full" />
                    <p>{percentCompleted}{'%'}</p>
                  </div>
                </ModalBody>

              </>
            )}
          </ModalContent>
        </Modal>

        <div className='flex flex-row'>
          <p>Current Root Path:&nbsp;&nbsp;</p>
          <p className='font-bold text-red-500'>{rootPath}</p>
        </div>

        {selectedFiles.length === 0 && <>
          <input
            type="file"
            ref={fileUpload}
            onChange={uploadProfilePic}
            multiple
            style={{ opacity: "0", "display": "none" }}
          />
          <Button onClick={() => handleUpload()} color='primary'>Select Files</Button>
        </>
        }
        {

          selectedFiles.length !== 0 && <div className='flex flex-col gap-4'>
            <Table aria-label="Example table with dynamic content">
              <TableHeader columns={columns}>
                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
              </TableHeader>
              <TableBody >
                {selectedFiles.map((item, index) => (
                  <TableRow key={index}>
                    {(columnKey) => <TableCell>{renderCell(item,index, columnKey)}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className='flex flex-row gap-4'>
              <Button className='basis-6/12' color="danger" onClick={handleDeleAllFilesButtonClick}>Delete All Files</Button>
              <Button className='basis-6/12' color='primary' onClick={handleUploadButtonClick}>Upload</Button>

            </div>
          </div>

        }
      </div>
    </>

  )
}

