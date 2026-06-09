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
const authRouter = require("./routes/authRoute");
const recommendationRouter = require("./routes/recommendationRoute");
const getInTouchRouter = require("./routes/getInTouchRoute");
const statsRouter = require("./routes/statsRoute");
const sponsorRoute = require("./routes/sponsorRoute");

// Registered Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/recommendation", recommendationRouter);
app.use("/api/v1/getInTouch", getInTouchRouter);
app.use("/api/v1/stats", statsRouter);
app.use("/api/v1/sponsor", sponsorRoute);

// Import Admin Routes
const adminAuthRouter = require("./routes/admin/adminAuthRoute");
const dashboardRouter = require("./routes/admin/dashboardRoute");
const sponsorManagementRouter = require("./routes/admin/sponsorManagementRoute");
const recommendationManagementRoute = require("./routes/admin/recommendationManagementRoute");
const businessManagementRoute = require("./routes/admin/businessManagementRoute");
const suburbManagementRoute = require("./routes/admin/suburbManagementRoute");
const clusterManagementRoute = require("./routes/admin/clusterManagementRoute");


// Registered Admin Routes
app.use("/api/v1/admin/auth", adminAuthRouter);
app.use("/api/v1/admin/dashboard", dashboardRouter);
app.use("/api/v1/admin/sponsor", sponsorManagementRouter);
app.use("/api/v1/admin/recommendation", recommendationManagementRoute);
app.use("/api/v1/admin/business", businessManagementRoute);
app.use("/api/v1/admin/suburb", suburbManagementRoute);
app.use("/api/v1/admin/cluster", clusterManagementRoute);

// API status route
app.get("/", (request, response) => response.send(`Neighbourly backend-server is up and running at port ${port}`));

// Error handling middleware
app.use(errorHandler);

module.exports = app;