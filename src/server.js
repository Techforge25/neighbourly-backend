require("dotenv").config();
const app = require("./app");
const { port } = require("./constants");
const connectDB = require("./database/connection");

// Connect db
connectDB()
.then(() => {
    app.on("error", () => console.log("Failed to listen"));
    app.listen(port, "0.0.0.0", () => console.log(`Server is up and running on port ${port}`));
})
.catch(error => console.log("Failed to connect with database", error.message));