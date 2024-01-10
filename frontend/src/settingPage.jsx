import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button, Input } from "@nextui-org/react";
import { Outlet } from "react-router-dom";
import { getBaseUrl } from './utli/axios.js'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
export default function SettingPage() {
  const [inputData, setInputData] = useState("");
  const notify = () => toast("Set the path successfully");

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
    if(response_code == 0){
      setInputData(response_msg)
    }
  }
  const handleSetButtonClick=async()=>{
    const { response_code, response_msg } = (await axios({
      url: "/root_path", method: 'PUT',
      baseURL: getBaseUrl(),
      data: {
        path: inputData
      }
    })).data;
    console.log(response_code);
    console.log(response_msg);
    if(response_code == 0){
      notify();
    }
   
  }
  return (
    <>
      <div className="p-4 flex flex-col">
        <Input value={inputData} onChange={(e) => setInputData(e.target.value)}></Input>
        <Button color="primary" onClick={handleSetButtonClick}>Set Path</Button>
        <ToastContainer />

      </div>
    </>

  )
}

