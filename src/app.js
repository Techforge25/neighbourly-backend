const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { corsOptions, port } = require("./constants");
const compression = require("compression");
const errorHandler = require("./middlewares/errorHandler");
const app = express();

// Middlewares
app.use(cors(corsOptions));
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(express.json({ limit: "50kb" }));
app.use("/public", express.static(path.resolve("public")));
app.use(compression());

// Import Routes
// const authRouter = require("./routes/auth");

// Registered Routes
// app.use("/api/v1/auth", authRouter);

// API status route
app.get("/", (request, response) => response.send(`Neighbourly backend-server is up and running at port ${port}`));

// Error handling middleware
app.use(errorHandler);

module.exports = app;