import{config} from "dotenv";
config({path:"./.env",
    quiet:true
});
import {Schema, model} from 'mongoose';
import { type } from 'os';
import bcrypt, { compare } from "bcryptjs"
import jwt from "jsonwebtoken";

const userSchema = new Schema({

    fullName:{
        type: 'String',
        required:[true,'Name is required'],
        minLenght:[5,'Name must be at least 5 characters'],
        maxLenght:[50,'Name must be at least 50 characters'],
        lowercase:true,
        trim:true
    },
    email:{
        type:'String',
        required:[true,'email is required'],
        lowercase:true,
        trim:true,
        unique:true,
       // match:[]
    },
    password:{ 
        type:String,
        required:[true,'email is required'],
        minLenght:[8,'password must be at least 8 characters'],
        select:false
    },
    avatar:{
        public_id:{
            type:'string'
        },
        secure_url:{
            type:'string'
        }
    },role:{
        type:'String',
        enum:['USER','ADMIN'],
        default:'USER'
    },
    forgotPasswordToken:{
        type:'String'
    },
    forgotPasswordExpiry:{
        type:'String'
    },

},{
    timestamps: true
}
);
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
   return next();
});
userSchema.methods =  {
    generateToken(){
        return jwt.sign(
            {_id:this._id,email:this.email},
            process.env.JWT_SECRET,
            {expiresIn:process.env.JWT_EXPIRY}

        )
    },

    comparePassword: async function (password) {
        return await bcrypt.compare(password, this.password)
    }

}



export const User =  model('User',userSchema);