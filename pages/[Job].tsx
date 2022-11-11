import React, { useState } from 'react'
import { useRouter } from "next/router";
import { useCallback } from 'react';
import { useEffect } from 'react';
import { BACKEND_URL } from '.';
import { Button } from '@chakra-ui/react';
export default function Job() { 
    const [Jobs,SetJobs] = useState<any>("");
    const router = useRouter();
    const {Job} = router.query;
    
    const updateId= useCallback(async () =>{
        if(!Job){
            return null;
        }
        console.log("jobsss")
        return Job;
    },[Job])

    useEffect(()=>{
        const up = async ()=>{
            const a  =await updateId();
            console.log("jobs",a);
            SetJobs(a);
        };  
        up();
    },[Job])
    
    const fetchdata = async () =>{
        let address = 23e23;
        const {status} = await fetch(`${BACKEND_URL}get`,{
            method:"POST",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify({
              address
            })
        })
    }
  return (


    
      <div>
        <Button
        onClick={fetchdata}
        >
Click
        </Button>
        Job
        </div>
  )
}
