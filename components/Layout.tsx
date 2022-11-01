import React from 'react'
import Header from "./Header";
export default function Layout({children}:{children:any}) {
  return (
    <div>
        <Header/>
        {children}
    </div>
  )
}
