import User from "../models/user.js";
import { Transaction, TransactionType } from "../models/transaction.js";
import { transactions } from "../config/testtransactions.js";
import { generateTransactionReference } from "../config/utils.js";
import axios from "axios";
import "dotenv/config";
const config = process.env;

const squadcoPrivateKey = config.SQUADCOPRIVATEKEY;

const headers = {
            Authorization: `Bearer ${squadcoPrivateKey}`,
          };

export const makeSingleTransfer = async (req, res) =>{
    const { 
        remark,
        bank_code,
        amount,
        account_number,
        account_name
     } = req.body
    try {
            const user = req.user;
            const transactionReference = generateTransactionReference()
            const transfer = await axios.post(`https://sandbox-api-d.squadco.com/payout/transfer`, {
                "remark": remark,
                "bank_code": bank_code,
                "currency_id": "NGN",
                "amount": parseFloat(amount)*100,
                "account_number": account_number,
                "transaction_reference": `SBLYDJBXZZ${transactionReference}`,
                "account_name": account_name
            }, { headers })
           
            console.log(transfer.data)
            if(transfer.status == 200){
                await Transaction.create({
                    user: user.user_id,
                    type: TransactionType.MONEY_TRANSFER,
                    amount: amount,
                    description: remark,
                    recipients: account_number,
                    transactionReference: `SBLYDJBXZZ${transactionReference}`,
                });
                return res.status(200).json({
                    status: true,
                    message:"Transfer Sucessful",
                    data: {
                        success: transfer.data
                    }
                });
            }else if(transfer.status == 401){
                return res.status(401).json({
                    status: false,
                    message:"Unauthorized"
                });
            }else if(transfer.status == 403){
                return res.status(403).json({
                    status: false,
                    message: "Forbidden",
                });
            }

        } catch (error) {
            console.log(error.response)
        return res.status(500).json({
            status: false,
            message:"An error occured " + error,
        });
    }
}

export const makeMultipleTransactions = async (req, res) => {
    const user_id = req.user.user_id;
    const transactions_array = req.body
    const total_amount = transactions_array.reduce((total, transaction) => {
        return total + parseFloat(transaction.amount || 0);
      }, 0);

    try {
      const batchSize = 5;
      const responses = await batchTransactions(transactions_array, batchSize);
      await User.findByIdAndUpdate(user_id, { 
        $inc: { balance: -total_amount }
    })
  
      return res.status(200).json({
        status: true,
        data: responses,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "An error occurred " + error,
      });
    }
  };
  
  const batchTransactions = async (transactions, batchSize) => {
    const responses = [];
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const batchResponse = await sendBatch(batch);
      responses.push(...batchResponse);
    }
    return responses;
  };
  
  const sendBatch = async (batch) => {
    const responses = [];
    for (const transaction of batch) {
      try {
        const makeTransaction = await axios.post('https://sandbox-api-d.squadco.com/payout/transfer', transaction, {
          headers,
        });
  
        responses.push({
          status: makeTransaction.status,
          data: makeTransaction.data,
        });
      } catch (error) {
        responses.push({
          status: error.response ? error.response.status : 500,
          error: error.message,
        });
      }
    }
  
    return responses;
  };

export const fundWallet = async (req, res) =>{
    const { amount } = req.body;
    const headers = {
        Authorization: `Bearer ${squadcoPrivateKey}`,
      }
      const user = req.user
      const transactionReference = generateTransactionReference();
    try {
        const sendMoney = await axios.post(`https://sandbox-api-d.squadco.com/transaction/initiate`, {
            "amount": parseFloat(amount)*100,
            "email": user.email,
            "currency":"NGN",
            "initiate_type": "inline",
            "transaction_ref": transactionReference,
            "callback_url":"http://squadco.com"
        }, { headers });

        if(sendMoney.status == 200){
            return res.status(200).json({
                status: true,
                message:"Transaction Processing, Follow checkout url to complete transaction",
                data: {
                    info: sendMoney.data
                }
            });
        }else if(sendMoney.status == 401){
            return res.status(401).json({
                status: false,
                message:"Unauthorized"
            });
        }else if(sendMoney.status == 400){
            return res.status(400).json({
                status: false,
                message: "Bad request",
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: true,
            message:"An error occured" + error
    })
}
}

export const verifyTransaction = async (req, res) => {
    try {
        const webHook = req.body

        const user = await User.findOne({email: webHook.Body.email})
        
        if(webHook){
            if(webHook.Event == 'charge_successful'){
                await User.updateOne({ 
                    email: webHook.Body.email }, 
                    { $inc: { balance: parseFloat(webHook.Body.amount)/100 } 
                });

                await Transaction.create({
                    user: user._id,
                    type: TransactionType.FUNDING,
                    amount: parseFloat(webHook.Body.amount)/100,
                    transactionReference: webHook.TransactionRef,
                    description: "Funding successful"
                })
            }
        }

        console.log(webHook)
    } catch (error) {
        return res.status(500).json({
            status: true,
            message:"An error occured" + error
        })
    }
}

export const riskAssessment = async (req, res) => {
        const { 
            transaction_amount,
            historical_transaction_amount,
            frequency,
            time_of_day,
            location,
            service
         } = req.body;
    try {
        const riskAssessment = await axios.post(`https://us-for-us.onrender.com/predict`, {
            "Transaction Amount": transaction_amount,
            "Historical Transaction Amount": historical_transaction_amount,
            "Frequency": frequency,
            "Time of Day":  time_of_day,
            "Location": location,
            "Service Type": service
        });

        if(riskAssessment.status == 200){
            if(riskAssessment.data.risk_score < 0.3){
                return res.status(200).json({
                    status: true,
                    message: "Less risk",
                    data: {
                        score: riskAssessment.data.risk_score
                    }
                }) 
            }
            if(riskAssessment.data.risk_score > 0.3){
                return res.status(200).json({
                    status: true,
                    message: "High risk",
                    data: {
                        score: riskAssessment.data.risk_score
                    }
                }) 
            }
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            message:"An error occured" + error
        }) 
    }
}

export const chatBot = async( req, res ) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            status: false,
            message:"An error occured" + error
        }) 
    }
}