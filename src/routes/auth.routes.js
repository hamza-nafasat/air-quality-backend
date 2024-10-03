import express from "express";
import { getMyProfile, login, logout, register } from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { singleUpload } from "../middlewares/multer.js";

const app = express();

app.post("/register", singleUpload, register);
app.post("/login", login);
app.get("/logout", isAuthenticated, logout);
app.get("/my-profile", isAuthenticated, getMyProfile);

export default app;
