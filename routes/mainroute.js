import { Router } from "express";
import { 
    fundWallet,
    makeSingleTransfer,
    makeMultipleTransactions,
    verifyTransaction,
    riskAssessment
} from "../controllers/maincontroller.js";
import { verifyToken } from "../middlewares/auth.js";
const router = Router();

router.route("/wallet/fund").post(verifyToken, fundWallet)
router.route("/transfer/single-transaction").post(verifyToken, makeSingleTransfer)
router.route("/transfer/multiple-transactions").post(verifyToken, makeMultipleTransactions)
router.route("/verify-transaction").post(verifyTransaction)
router.route("/risk-assessment").post(verifyToken, riskAssessment)
export default router;