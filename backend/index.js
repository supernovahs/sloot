// ***************************************************************
// ************************* BACKEND *****************************
// ***************************************************************
import cors from "cors";
import express from "express";
import { schedule } from "node-cron";
import { MongoClient } from "mongodb";
import { providers, BigNumber, utils } from "ethers";
import { createTransport } from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();
const port =process.env.PORT || 49899;
const app = express();
app.use(cors());
app.use(express.json());
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Headers', 'application/json,Content-Type');

    // Pass to next layer of middleware
    next();
});

const mainnetprovider =  new providers.JsonRpcProvider(process.env.RPC_MAINNET);
const goerliprovider = new providers.JsonRpcProvider(process.env.RPC_GOERLI);

var transporter = createTransport({ 
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });
// ...

// Schedule tasks to be run on the server.
schedule('0,15,30,45 * * * *', function() {
    update();
  });

app.post("/post",async(req,res)=>{
    const previous = req.body.Result;
    const ContractAddress = req.body.ContractAddress;
    const slot = req.body.Slot;
    const type = req.body.Type;
    const email = req.body.email;
    const network = req.body.Network;

    console.log(`network ${network} previous ${previous} address ${ContractAddress} slot ${slot} type ${type}`);
    // New DB 
    const uri = process.env.DATABASE_URI;
    const client = new MongoClient(uri);
    const database = client.db('sloot');
    const fields = database.collection('slot');
    var fld = {network : network,email:email,address:ContractAddress,slot:slot,previous:previous,type:type}
    fields.insertOne(fld, function(err,res) {
        if (err) throw err;
        console.log("Added new Entry!!");
    })

})

app.post("/remove",async(req,res)=>{
    const {previous,address,slot,type} = req.body;
    // console.log(`previous ${previous} address ${address} slot ${slot} type ${type}`);

    // New DB 
   
})

app.post("/replace",async(req,res)=>{
    const {previous,address,slot,type} = req.body;
    console.log(`previous ${previous} address ${address} slot ${slot} type ${type}`);
    // New DB 
})

// app.post("/get",async(req,res)=>{
//     const {WalletAddress} = req.body.address;
//     console.log("Wallet_address",WalletAddress);
//     const uri = process.env.DATABASE_URI;
//     const client = new MongoClient(uri);
//     const database = client.db('sloot');
//     const fields = database.collection('slot');
    // const query = {network : "goerli"};

    // const a = fields.find(query);
    // console.log("a");

// })

app.listen(port, () => {
    console.log("Started to listen  ",port);
})

const update = async () => {
    const uri = process.env.DATABASE_URI;
    const client = new MongoClient(uri);
    const database = client.db('sloot');
    const fields = database.collection('slot');
    
    fields.find({}).toArray(async function(err,field){
        if (err) throw err;
       
        let a;
        for(let i =0; i< field.length; i++){
          try{
            
              a = await UpdateSlot(field[i].network,field[i].previous,field[i].address,field[i].slot,field[i].type);
            }catch(err){
                console.log("error in updating");
            }
            console.log("a",a);
            if(a !=0 ){
                console.log("CHANGE IN SLOT!!!!!!!");
                // Update db
                let newval = {$set: {network : field[i].network,email:field[i].email,address:field[i].address,slot:field[i].slot,previous:a,type:field[i].type}};
                fields.updateOne(field[i],newval,function(err,re){
                    if(err) throw err;
                    console.log("Updated successfully");
                })
                // notify by email
        
                let messageOptions = {
                    from: process.env.EMAIL,
                    to: 'supernovahs@proton.me',
                    subject: `Sloot:Change in storage slot!! `,
                    text:
                    `
                    Network:${field[i].network} \n
                    Contract Address : ${field[i].address} \n
                    Slot: ${field[i].slot} \n
                    Type: ${field[i].type} \n
                    Changed from ${field[i].previous} to ${a} 
                    `
                  };
                  
                  transporter.sendMail(messageOptions, function(error, info) {
                    if (error) {
                      throw error;
                    } else {
                      console.log('Email successfully sent!');
                    }
                  });
            }
        }
     
    });

}
update();

const UpdateSlot = async (network,previous,address,slot,Type) =>{
   
 let res;
 console.log("slot",slot);
    if(network == "mainnet"){
     res = await mainnetprovider.getStorageAt(address,BigNumber.from(slot).toHexString());
    }
    if(network === "goerli"){
        res = await goerliprovider.getStorageAt(address,BigNumber.from(slot).toHexString());
    }

    if(Type == "address"){
        let z = utils.defaultAbiCoder.decode(["address"],res);
        console.log("z",z);
        return previous ===  z[0] ? 0 : z[0]; 
    }
    if(Type == "uint"){
        let z = utils.defaultAbiCoder.decode(["uint"],res);
        return previous ===  (BigNumber.from(z[0]).toString()) ? 0 : (BigNumber.from(z[0]).toString());
    }
    if(Type  == "string"){
        let z = utils.toUtf8String(res);
        return previous === z ? 0 : z;
    }
}


