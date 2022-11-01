import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Input,Button } from '@chakra-ui/react';
import { useState } from 'react';
import { useProvider } from 'wagmi'
import { Select } from '@chakra-ui/react';
const ethers = require("ethers");


const Home: NextPage = () => {
  const [ContractAddress,SetContractAddress] = useState<string>("");
  const [Slot,SetSlot] = useState<number | null>();
  const [Type,SetType] = useState< string >();
  const [Result,SetResult] = useState<number | string > ();
  const provider = useProvider();
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    SetType(event.target.value)
  }
  
  return (
    <div>
      <Input
        placeholder='ContractAddress'
        value = {ContractAddress}
        onChange= {e => SetContractAddress(e.target.value)}
      />
      <Input
        placeholder='Slot'
        value = {Slot}
        onChange= {e => SetSlot(e.target.value)}
      />
      <Select
      value={Type}
      onChange={handleChange}
      placeholder="Select Option"
    >
      <option value='address' >Address</option>
      <option value='uint'> uint</option>
      {/* <option value='option3'>Option 3</option> */}
      </Select>
      <Button
        onClick={async() =>{
          console.log("Type",Type);
          console.log("provider",provider);
          console.log("contractaddress",ContractAddress);
          console.log("slot",Slot);
          const a = await provider.getStorageAt(ContractAddress,ethers.BigNumber.from(Slot).toHexString());
          console.log("a",a);
          if(Type == "address"){

            const decodedval = ethers.utils.defaultAbiCoder.decode(["address"],a);
            SetResult(decodedval);
            console.log("decodedvalue",decodedval);
          }
          else if (Type == "uint"){
            const decodedval = ethers.utils.defaultAbiCoder.decode(["uint"],a);
            SetResult(ethers.BigNumber.from(decodedval[0]).toString());
            console.log("decodedval",ethers.BigNumber.from(decodedval[0]).toString());
          }
        }}
      >
        Go
      </Button>
      <h2>Result</h2>
      <h4>{Result}</h4>
    </div>
  );
};

export default Home;
