import mongoose from "mongoose";
import { config } from "dotenv";
config({quiet:true});
mongoose.set('strictQuery',false);
const connectionToDb = async() => {
    try{
        const {connection} =await mongoose.connect( process.env.MONGO_URL );
        if(connection){
            console.log(`Connected to MongoDB : ${connection.host}`);
            
        }
    }catch(e){
        console.log("hello");
        
        console.log("errors: ",e);
        process.exit(1);
    }
 }
 export default connectionToDb;