import express from "express";
import { getSuggestion } from "../controllers/suggestion.controller.js";

const router = express.Router();

router.get("/", getSuggestion);

export default router;
