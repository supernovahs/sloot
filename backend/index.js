const cron = require("node-cron");
const { MongoClient } = require("mongodb");
const { join } = require("path");
const ethers = require("ethers");
const nodemailer = require('nodemailer');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_MAINNET);
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });
// ...

// Schedule tasks to be run on the server.
cron.schedule('* * * * *', function() {
    update();
  });

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
    console.log("address",address);
    let res = await provider.getStorageAt(address,ethers.BigNumber.from(slot).toHexString());
    if(Type == "address"){
        console.log("address ok");
        let z = ethers.utils.defaultAbiCoder.decode(["address"],res);
        console.log("z",z);
        return previous ===  z[0] ? 0 : z[0]; 
    }
    if(Type == "uint"){
        let z = ethers.utils.defaultAbiCoder.decode(["uint"],res);
        return previous ===  (ethers.BigNumber.from(z[0]).toString()) ? 0 : (ethers.BigNumber.from(z[0]).toString());
    }
}


