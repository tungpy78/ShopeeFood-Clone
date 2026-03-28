import { Router } from "express";
import { getMerchant } from "../controllers/CustomerController";

const customerRouter = Router();

customerRouter.get('/merchants', getMerchant)


export default customerRouter