import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Input,Button } from '@chakra-ui/react';
import { useState } from 'react';
import { useProvider } from 'wagmi'
import { Select } from '@chakra-ui/react';
const ethers = require("ethers");
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL_SLOOT;

const Home: NextPage = () => {
  const [ContractAddress,SetContractAddress] = useState<string>("");
  const [Slot,SetSlot] = useState<string | null>();
  const [Type,SetType] = useState< string >();
  const [Result,SetResult] = useState<number | string > ();
  const provider = useProvider();
  const [Processing, SetProcessing] = useState<boolean>(false);
  const [email,SetEmail] = useState<string>();
  const [Network,SetNetwork] = useState<string>();

  const handleChange = (event:any) => {
    SetType(event.target.value)
  }

  const handleNetwork = (event:any) =>{
    SetNetwork(event.target.value);
  } 

  return (
    <div>
      <div className='border-2 border-sky-500'>
      <Select
      value={Network}
      onChange={handleNetwork}
      placeholder="Select Network"
      >
      <option value='mainnet' >Mainnet</option>
      <option value='goerli'> Goerli</option>
      </Select>
      <Input
        placeholder='ContractAddress'
        value = {ContractAddress}
        onChange= {e => SetContractAddress(e.target.value)}
        />
      <Input
        placeholder='Slot'
        value = {Slot!}
        onChange= {e => SetSlot(e.target.value)}
        />
      <Select
      value={Type}
      onChange={handleChange}
      placeholder="Select Option"
      >
      <option value='address' >Address</option>
      <option value='uint'> uint</option>
      <option value="string">string</option>
      </Select>
      <Input
        placeholder='Email address'
        value = {email}
        onChange= {e => SetEmail(e.target.value)}
        />
      <Button
        onClick={async() =>{
          SetProcessing(!Processing);
          console.log("Type",Type);
          console.log("provider",provider);
          console.log("contractaddress",ContractAddress);
          console.log("slot",Slot);
          const a = await provider.getStorageAt(ContractAddress,ethers.BigNumber.from(Slot).toHexString());
          console.log("a",a);
          if(Type == "address"){
            
            const decodedval = ethers.utils.defaultAbiCoder.decode(["address"],a);
            let Result:any = decodedval[0];
            console.log("decodedvalue",decodedval);
            console.log("Contractaddress",ContractAddress);
          const {status} = await fetch(`${BACKEND_URL}post`,{
            method:"POST",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify({
              Network,
              Result,
              ContractAddress,
              Slot,
              Type,
              email
            })
          })
          console.log("status",status);
          SetProcessing(!Processing);
          }
          if (Type == "uint"){
            const decodedval = ethers.utils.defaultAbiCoder.decode(["uint"],a);
            let Result:string = ethers.BigNumber.from(decodedval[0]).toString();
            console.log("decodedval",ethers.BigNumber.from(decodedval[0]).toString());

            const {status} = await fetch(`${BACKEND_URL}post`,{
              method:"POST",
              headers:{"Content-Type": "application/json"},
              body: JSON.stringify({
                Result,
                ContractAddress,
                Slot,
                Type,
                email
              })
            })
            console.log("status",status);
            SetProcessing(!Processing);
            
          }
          if(Type == "string"){
            const decodedval = ethers.utils.toUtf8String(a);
            console.log("Decoded Value string",decodedval);
            let Result:string = decodedval;
 
            const {status} = await fetch(`${BACKEND_URL}post`,{
              method:"POST",
              headers:{"Content-Type": "application/json"},
              body: JSON.stringify({
                Result,
                ContractAddress,
                Slot,
                Type,
                email
              })
            })
            console.log("status",status);
            SetProcessing(!Processing);
          }
          
        }}
        >
        Go
      </Button>
        </div>
      <h4>{Result}</h4>
    </div>
  );
};

export default Home;
