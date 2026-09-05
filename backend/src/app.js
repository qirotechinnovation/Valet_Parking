const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const parkingSlotRoutes = require("./routes/parkingSlotRoutes");
const parkingAdminRoutes = require("./routes/parkingAdminRoutes");
const parkingSessionRoutes = require("./routes/parkingSessionRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const receptionRoutes = require("./routes/receptionRoutes");
const customerRoutes = require("./routes/customerRoutes");
const vehicleInspectionRoutes = require("./routes/vehicleInspectionRoutes");
const parkingBookingRoutes = require("./routes/parkingBookingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const keyRoutes = require("./routes/keyRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/parking-slots", parkingSlotRoutes);
app.use("/api/parking-admin", parkingAdminRoutes);
app.use("/api/reception", receptionRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/vehicle-inspections", vehicleInspectionRoutes);
app.use("/api/parking-bookings", parkingBookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/keys", keyRoutes);
app.use(
  "/api/parking-admin/sessions",
  parkingSessionRoutes
);
app.use("/api/incidents", incidentRoutes);

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/feedback", feedbackRoutes);

module.exports = app;