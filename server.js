import app from'./app.js';
import dotenv from 'dotenv'
import connectionToDB from './config/dbConnection.js'
dotenv.config({quiet:true});
const PORT = process.env.PORT ||5000;
const HOSTNAME = process.env.HOSTNAME || '127.0.0.1';
app.listen(PORT,async()=>{
    await connectionToDB()
    console.log(`Server is running at http://${HOSTNAME}:${PORT}`);
    
});