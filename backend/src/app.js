const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const parkingSlotRoutes = require("./routes/parkingSlotRoutes");
const parkingAdminRoutes = require("./routes/parkingAdminRoutes");


const app = express();



app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/parking-slots", parkingSlotRoutes);
app.use("/api/parking-admin", parkingAdminRoutes);
module.exports = app;