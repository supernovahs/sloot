import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Input,Button } from '@chakra-ui/react';
import { useState } from 'react';
import { useProvider } from 'wagmi'
import { Select } from '@chakra-ui/react';
import { useSigner } from 'wagmi';
import { useColorMode } from '@chakra-ui/react';
const ethers = require("ethers");
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL_SLOOT;

const Home: NextPage = () => {
  const { toggleColorMode } = useColorMode();
  const [ContractAddress,SetContractAddress] = useState<string>("");
  const [Slot,SetSlot] = useState<string | null>();
  const [Type,SetType] = useState< string >();
  const [Result,SetResult] = useState<number | string > ();
  const provider = useProvider();
  const [Processing, SetProcessing] = useState<boolean>(false);
  const [email,SetEmail] = useState<string>();
  const [Network,SetNetwork] = useState<string>();
  const { data: signer, isError, isLoading } = useSigner();
  const handleChange = (event:any) => {
    SetType(event.target.value)
  }

  const handleNetwork = (event:any) =>{
    SetNetwork(event.target.value);
  } 

  return (
    <div>
      <div className='flex-box'>

      <Button onClick = {toggleColorMode}> Change Theme</Button>
      </div>
      <div className='border-2 border-sky-500'>
        <div className='m-6'>

      <Select
      value={Network}
      onChange={handleNetwork}
      placeholder="Select Network"
      >
      <option value='mainnet' >Mainnet</option>
      <option value='goerli'> Goerli</option>
      </Select>
      </div>
      <div
      className='m-6'
      >

      <Input
        placeholder='ContractAddress'
        value = {ContractAddress}
        onChange= {e => SetContractAddress(e.target.value)}
        />
        </div>
        <div className='m-6'>
          
      <Input
        placeholder='Slot'
        value = {Slot!}
        onChange= {e => SetSlot(e.target.value)}
        />
        </div>
        <div className='m-6'>

      <Select
      value={Type}
      onChange={handleChange}
      placeholder="Select Option"
      >
      <option value='address' >Address</option>
      <option value='uint'> uint</option>
      <option value="string">string</option>
      <option value="bytes32">bytes32</option>
      </Select>
        </div>
        <div className='m-6'>

      <Input
        placeholder='Email address'
        value = {email}
        onChange= {e => SetEmail(e.target.value)}
        />
        </div>
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
          if(Type == "string"){
            const decodedval = ethers.utils.toUtf8String(a);
            console.log("Decoded Value string",decodedval);
            let Result:string = decodedval;
 
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
          // if(Type == "bytes32"){
          //   console.log("encoded value bytes32",a);
          //   const decodedval = ethers.utils.defaultAbiCoder.decode(["bytes32"],a);
          //   console.log("decodedval bytes32",decodedval);
            // console.log("Decoded Value string",decodedval);
            // let Result:string = decodedval;
 
            // const {status} = await fetch(`${BACKEND_URL}post`,{
            //   method:"POST",
            //   headers:{"Content-Type": "application/json"},
            //   body: JSON.stringify({
            //     Network,
            //     Result,
            //     ContractAddress,
            //     Slot,
            //     Type,
            //     email
            //   })
            // })
            // console.log("status",status);
            // SetProcessing(!Processing);
          // }
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
