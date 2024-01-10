import { useState,useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button } from "@nextui-org/react";
import { Outlet } from "react-router-dom";

export default  function SettingPage() {
  const [count, setCount] = useState(0)
 
    const onButtonClick =async () => {
    // `current` points to the mounted file input element
    const dirHandle = await window.showDirectoryPicker();
    console.log(dirHandle);

  };
  const onChange=(e)=>{
    let f=e.target.files;
    console.log(e)
  }
  return (
    <>
     <div strongIos outlineIos className="space-y-4">
        <p>
          Sheet Modals slide up from the bottom of the screen to reveal more
          content. Such modals allow to create custom overlays with custom
          content.
        </p>
        <p>
          <Button onClick={() => onButtonClick()}>Open Sheet</Button>
        </p>
      

        <input id="myInput" type="file" webkitdirectory directory multiple/>


      </div>
    </>

  )
}

