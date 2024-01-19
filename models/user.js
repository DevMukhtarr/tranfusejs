import { Schema, model } from 'mongoose';

const userSchema= new Schema({
    first_name: {
        type: String, 
        trim: true,
    },
    last_name: {
        type: String,
        trim: true,
    },
    user_name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    account_number: {
        type: String,
        trim: true
    },
    balance: {
        type: Number,
    },
    password: {
        type: String,
    },
    organization: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = model('User', userSchema)

export default User