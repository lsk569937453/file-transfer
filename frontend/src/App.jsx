import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button } from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/react";
import { BrowserRouter, useNavigate, HashRouter, Route, Routes } from 'react-router-dom';

import { Link } from 'react-router-dom'

import { Outlet } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import DownloadPage from './downloadPage';
import UploadPage from './uploadPage';
import SettingPage from './settingPage';
import { NextUIProvider } from '@nextui-org/react';

const headerdata = [
  
  {
    id: "Computer",
    label: "Computer",
    link: "/downloadPage",
    svg: <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-narrow-down" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M16 15l-4 4" /><path d="M8 15l4 4" /></svg>,
    div: <DownloadPage />
  },
  {
    id: "Upload",
    label: "Upload",
    link: "/uploadPage",
    svg: <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-narrow-up" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M16 9l-4 -4" /><path d="M8 9l4 -4" /></svg>,
    div: <UploadPage />
  },
  {
    id: "Setting",
    label: "Setting",
    link: "/settingPage",
    svg: <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-narrow-up" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M16 9l-4 -4" /><path d="M8 9l4 -4" /></svg>,
    div: <SettingPage />

  },
];
const router = [
  {
    path: "/",
    element: <DownloadPage />,
  },
  {
    path: "/downloadPage",
    element: <DownloadPage />,
  },
  {
    path: "/uploadPage",
    element: <UploadPage />,
  },
  {
    path: "/settingPage",
    element: <SettingPage />,
  },
];
function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <NextUIProvider navigate={navigate}>

      <div>
        <Tabs selectedKey={pathname} items={headerdata} classNames={{
          base: "w-full",
          tab: "px-5 py-3 text-md font-bold justify-center",
          tabList: "w-full",
        }}
        >
          {(item) => (
            <Tab key={item.id} title={item.label} href={item.link} />
          )}
        </Tabs>
      </div>
        <Routes>
          {router.map((item, index) => (
            <Route path={item.path} element={item.element} />
          ))}
        </Routes>
    </NextUIProvider>
    // <Page>
    //   <Navbar
    //     title="File Transfer"
    //     className="top-0 sticky "
    //     innerClassName='h-6 justify-center pt-2'

    //     subnavbar={
    //       <Segmented strong>
    //         {
    //           headerdata.map((item,index)=>{
    //             return(
    //               <Link to={item.link} key={index}  className='w-full'>
    //               <SegmentedButton small strong active={item.link===location.pathname}>
    //                 {item.name}
    //               </SegmentedButton>
    //               </Link>
    //             )
    //           })
    //         }

    //       </Segmented>
    //     }
    //   />
    //   <div id="detail" className="relative">
    //   {/* <Block >
    //     <p>
    //       Subnavbar is useful when you need to put any additional elements
    //       into Navbar, like Tab Links or Search Bar. It also remains visible
    //       when Navbar hidden.
    //     </p>
    //   </Block> */}
    //     <Outlet />

    //   </div>
    // </Page>


  )
}

export default App
