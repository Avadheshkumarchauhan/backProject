import mongoose from "mongoose";
import { config } from "dotenv";
import { databaseName } from "../database.js";
config({quiet:true})
mongoose.set('strictQuery',false);
 const connectionToDb = async() => {
    try{
        const {connection} =await mongoose.connect(
            `${process.env.MONGO_URL}${databaseName}`||'mongodb://127.0.0.1:27017/website',{
                serverSelectionTimeoutMS: 30000
            }
        );
        if(connection){
            console.log(`Connected to MongoDB : ${connection.host}`);
            
        }
    }catch(e){
        console.log(e);
        process.exit(1);
    }
 }
 export default connectionToDb;