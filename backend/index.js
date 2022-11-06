const cron = require("node-cron");
const { MongoClient } = require("mongodb");
const { join } = require("path");
const ethers = require("ethers");
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_MAINNET);

// ...

// Schedule tasks to be run on the server.
cron.schedule('* * * * *', function() {
    update();
  });

const update = async () => {
    console.log("process",process.env.DATABASE_URI);
    const uri = process.env.DATABASE_URI;
    const client = new MongoClient(uri);
    var query = { email: "harshitsinghal252@gmail.com"};
    const database = client.db('sloot');
    const fields = database.collection('slot');
    console.log("fields",fields);
    fields.find({}).toArray(async function(err,field){
        if (err) throw err;
        console.log("field",field);
        console.log("fields length",field.length);
        let a;
        for(let i =0; i< field.length; i++){
            console.log("field i " , field[i]);
             a = await UpdateSlot(field[i].previous,field[i].address,field[i].slot,field[i].type);
            console.log("a",a);
        }
       

     if(a !=0 ){
        // Update db
        let newval = {$set: {email:field.email,address:field.address,slot:field.slot,previous:a,type:field.type}};
        fields.updateOne(field,newval,function(err,re){
            if(err) throw err;
            console.log("Updated successfully");
        })
        // notify by email

    }
    });

}
update();

const UpdateSlot = async (previous,address,slot,Type) =>{
    console.log("address",address);
    let res = await provider.getStorageAt(address,0);
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


