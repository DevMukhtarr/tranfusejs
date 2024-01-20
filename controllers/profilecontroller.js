import "dotenv/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

export const editProfile = async (req, res) => {
    const { 
        first_name,
        last_name,
        user_name,
        email,
        old_password,
        new_password,
        confirm_password,
        organization
     } = req.body
    try {
        const user_id = req.user.user_id;

        const user = await User.findById(user_id);

        if(!await bcrypt.compare(old_password, user.password)){
            return res.status(400).json({
                status: false,
                message: 'Password does not match',
              });
        }

        if( new_password !== confirm_password){
            return res.status(400).json({
                status: false,
                message: 'Password does not match',
              });
        }

        const encryptedPassword = await bcrypt.hash(new_password, 12)

        const userUpdates = {};

        if (req.body.first_name !== undefined) userUpdates.first_name = req.body.first_name;
        if (req.body.last_name !== undefined) userUpdates.last_name = req.body.last_name;
        if (req.body.user_name !== undefined) userUpdates.user_name = req.body.user_name;
        if (req.body.email !== undefined) userUpdates.email = req.body.email;
        if (req.body.password !== undefined) userUpdates.password = encryptedPassword;
        if (req.body.organization !== undefined) userUpdates.organization = req.body.organization;

        const updatedUser = await User.findByIdAndUpdate(user_id, 
            userUpdates, 
            { 
                new: true 
            });

            if (!updatedUser) {
                return res.status(404).json({
                  status: false,
                  message: 'User not found',
                });
              }

              const { password, createdAt, account_number, ...userWithoutPassword } = updatedUser.toJSON();

              return res.status(200).json({
                status: true,
                message: 'Profile updated successfully',
                data: userWithoutPassword,
              });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "An error occurred" + error,
          });
    }
}

export const getProfile = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const user = await User.findById(user_id);

        const { password, createdAt, account_number, ...userWithoutSomeData } = user.toJSON();

        const profile = user;

        return res.status(200).json({
            status: true,
            message:"User profile",
            data: {
                userWithoutSomeData
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message:"An error occured " + error,
        });
    }
}
