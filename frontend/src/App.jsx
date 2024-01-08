import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button } from "@nextui-org/react";
import {
  Page,
  Navbar,
  NavbarBackLink,
  Block,
  Segmented,
  SegmentedButton,
} from 'konsta/react';
import {Link} from 'react-router-dom'

import { Outlet } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
const headerdata = [
  {
    name: "Computer",
    link: "/downloadPage",
    svg: <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-narrow-down" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M16 15l-4 4" /><path d="M8 15l4 4" /></svg>

  },
  {
    name: "Upload",
    link: "/uploadPage",
    svg: <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-narrow-up" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M16 9l-4 -4" /><path d="M8 9l4 -4" /></svg>
  },
  {
    name: "Setting",
    link: "/settingPage",
    svg: <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-arrow-narrow-up" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M16 9l-4 -4" /><path d="M8 9l4 -4" /></svg>
  },
];
function App() {
  const [count, setCount] = useState(0)
  let location = useLocation();
  useEffect(() => {
    console.log(location.pathname);
    console.log(location.pathname == "/downloadPage");
  }, [location]);
  return (
    <>

      <Page>
        <Navbar
          title="File Transfer"
          className="top-0 sticky "
          innerClassName='h-6 justify-center pt-2'
          
          subnavbar={
            <Segmented strong>
              {
                headerdata.map((item,index)=>{
                  return(
                    <Link to={item.link} key={index}  className='w-full'>
                    <SegmentedButton small strong active={item.link===location.pathname}>
                      {item.name}
                    </SegmentedButton>
                    </Link>
                  )
                })
              }
           
            </Segmented>
          }
        />
        <div id="detail" className="relative">
        {/* <Block >
          <p>
            Subnavbar is useful when you need to put any additional elements
            into Navbar, like Tab Links or Search Bar. It also remains visible
            when Navbar hidden.
          </p>
        </Block> */}
          <Outlet />

        </div>
      </Page>

    </>

  )
}

export default App
