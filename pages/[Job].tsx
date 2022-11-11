import React, { useState } from 'react'
import { useRouter } from "next/router";
import { useCallback } from 'react';
import { useEffect } from 'react';
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
    
  return (
      <div>
        Job
        </div>
  )
}
