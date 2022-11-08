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

const provider = new providers.JsonRpcProvider(process.env.RPC_MAINNET);
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
    console.log(`previous ${previous} address ${ContractAddress} slot ${slot} type ${type}`);
    // New DB 
    const uri = process.env.DATABASE_URI;
    const client = new MongoClient(uri);
    const database = client.db('sloot');
    const fields = database.collection('slot');
    var fld = {email:email,address:ContractAddress,slot:slot,previous:previous,type:type}
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

app.listen(port, () => {
    console.log("Started to listen  ",port);
})

const update = async () => {
    console.log("process",process.env.DATABASE_URI);
    const uri = process.env.DATABASE_URI;
    const client = new MongoClient(uri);
    const database = client.db('sloot');
    const fields = database.collection('slot');
    
    fields.find({}).toArray(async function(err,field){
        if (err) throw err;
       
        let a;
        for(let i =0; i< field.length; i++){
          
             a = await UpdateSlot(field[i].previous,field[i].address,field[i].slot,field[i].type);
            console.log("a",a);
            if(a !=0 ){
                console.log("CHANGE IN SLOT!!!!!!!");
                // Update db
                let newval = {$set: {email:field[i].email,address:field[i].address,slot:field[i].slot,previous:a,type:field[i].type}};
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

const UpdateSlot = async (previous,address,slot,Type) =>{
    let res = await provider.getStorageAt(address,BigNumber.from(slot).toHexString());

    if(Type == "address"){
        let z = utils.defaultAbiCoder.decode(["address"],res);
        console.log("z",z);
        return previous ===  z[0] ? 0 : z[0]; 
    }
    if(Type == "uint"){
        let z = utils.defaultAbiCoder.decode(["uint"],res);
        return previous ===  (BigNumber.from(z[0]).toString()) ? 0 : (BigNumber.from(z[0]).toString());
    }
}


