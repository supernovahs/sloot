// ***************************************************************
// ************************* BACKEND *****************************
// ***************************************************************
import cors from "cors";
import express, { json } from "express";
import { schedule } from "node-cron";
import { MongoClient } from "mongodb";
import { join } from "path";
import { providers, BigNumber, utils } from "ethers";
import { createTransport } from 'nodemailer';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
const port = process.env.PORT || 49899;
const app = express();
app.use(cors());
app.use(json());

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
schedule('0 4 * * *', function() {
    update();
  });

app.post("/post",async(req,res)=>{
    const {previous,address,slot,type} = req.body;
    console.log(`previous ${previous} address ${address} slot ${slot} type ${type}`);
    // New DB 

})

app.post("/remove",async(req,res)=>{
    const {previous,address,slot,type} = req.body;
    console.log(`previous ${previous} address ${address} slot ${slot} type ${type}`);

    // New DB 
})

app.post("/replace",async(req,res)=>{
    const {previous,address,slot,type} = req.body;
    console.log(`previous ${previous} address ${address} slot ${slot} type ${type}`);

    // New DB 
})

app.listen(port, () => {
    // console.log("Started to listen  ",server);
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
                    subject: 'Scheduled Email',
                    text: 'Hi there. This email was automatically sent by us.'
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


