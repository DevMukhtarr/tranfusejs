import "dotenv/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Transaction } from "../models/transaction.js";
import User from "../models/user.js";
// new user sign up
export const signUp = async (req, res) => {
    try {
        const { 
            first_name, 
            last_name, 
            user_name, 
            email, 
            organization,
            password, 
            confirm_password, 
        } = req.body
    
        if( password !== confirm_password){
            return res.status(409).json({
                status: false,
                message:"Password and confirm password does not match"
            });
            
        }
        // olduser 
        const Olduser = await User.findOne({email: email})
    
        if(Olduser){
            return res.status(424).json({
                status: false,
                message:"user exists already"
            });
        }
        
        console.log(password)
        console.log(confirm_password)
        const encryptedPassword = await bcrypt.hash(password, 12)
    
        const newUser = await User.create({
                    first_name,
                    last_name,
                    user_name,
                    email: email,
                    organization: organization,
                    password: encryptedPassword
            })
    
        const jwt_token = await jwt.sign({
            user_id: newUser._id,
            email: email
        }, process.env.JWT_TOKEN_KEY, {
            expiresIn: "123d",
        })
        
        return res.status(200).json({
            status: true,
            message:"New user created succesfully",
            data: {
                first_name,
                last_name,
                user_name, 
                email,
                access_token: jwt_token
            }
        });
    } catch (error) {
        console.log(console.log(error))
        return res.status(500).json({
            status: false,
            message: "An error occurred" + error,
          });
    }
}

// signin 
export const signIn = async (req, res) =>{
    const { email, password } = req.body
    try { 
        const user = await User.findOne({email: email})
    
        if(!user){
            return res.status(409).json({
                status: false,
                message:"User not found"
            });
        }
        
        if(user.email && (await bcrypt.compare(password, user.password))){
                const jwt_token = await jwt.sign({
                    user_id: user._id,
                    email: email
                }, process.env.JWT_TOKEN_KEY, {
                    expiresIn: "123d",
                })
                
                return res.status(200).json({
                    status: true,
                    message:"user signed in succesfully",
                    data: {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        user_name: user.user_name, 
                        email: user.email,
                        access_token: jwt_token
                    }
                }); 
            }
            return res.status(424).json({
                status: false,
                message:"Incorrect email or password"
            });
        
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "An error occurred",
          });
    }
}