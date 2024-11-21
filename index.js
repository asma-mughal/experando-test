import express from "express";
import connectDB from "./config/connectDB.js";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import Routes from "./routes/index.js";
import { app, server } from "./socket/socket.js";  // Import both app and server from socket.js

dotenv.config();
connectDB();

const PORT = process.env.PORT || 8080;
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
app.use(express.json());

// Routes
app.use("", Routes);

app.get("/", async (req, res) => {
    try {
        res.send("Server Working!");
    } catch (error) {
        console.log(error);
    }
});

// Use the server instance to listen for HTTP and WebSocket traffic
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
