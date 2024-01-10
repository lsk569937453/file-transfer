import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button,Input } from "@nextui-org/react";
import { Outlet } from "react-router-dom";

export default function SettingPage() {
  const [inputData,setInputData]=useState("ssss");
  const onButtonClick = async () => {
    // `current` points to the mounted file input element
    const dirHandle = await window.showDirectoryPicker();
    console.log(dirHandle);

  };
  const onChange = (e) => {
    let f = e.target.files;
    console.log(e)
  }
  return (
    <>
      <div className="p-4 flex flex-col">
        <Input value={inputData} onChange={(e)=>setInputData(e.target.value)}></Input>
        <Button color="primary">Set Path</Button>

      </div>
    </>

  )
}

