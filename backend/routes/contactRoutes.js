import { Router } from "express";
import { sendContactMessage } from "../controllers/contactController.js";

const router = Router();

// Route de contact utilisée par le frontend (PropertyDetails)
router.post("/", sendContactMessage);

export default router;


