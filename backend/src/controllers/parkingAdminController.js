const supabase = require("../config/supabase");

const getParkingAdminDashboard = async (req, res) => {
  try {
    // Total parking slots
    const { count: totalSlots, error: totalSlotsError } = await supabase
      .from("parking_slots")
      .select("*", { count: "exact", head: true });

    if (totalSlotsError) {
      throw totalSlotsError;
    }

    // Available slots
    const { count: availableSlots, error: availableSlotsError } = await supabase
      .from("parking_slots")
      .select("*", { count: "exact", head: true })
      .eq("status", "available");

    if (availableSlotsError) {
      throw availableSlotsError;
    }

    // Occupied slots
    const { count: occupiedSlots, error: occupiedSlotsError } = await supabase
      .from("parking_slots")
      .select("*", { count: "exact", head: true })
      .eq("status", "occupied");

    if (occupiedSlotsError) {
      throw occupiedSlotsError;
    }

    // Maintenance slots
    const { count: maintenanceSlots, error: maintenanceSlotsError } =
      await supabase
        .from("parking_slots")
        .select("*", { count: "exact", head: true })
        .eq("status", "maintenance");

    if (maintenanceSlotsError) {
      throw maintenanceSlotsError;
    }

    // Active parking sessions
    const { count: activeSessions, error: activeSessionsError } =
      await supabase
        .from("parking_sessions")
        .select("*", { count: "exact", head: true })
        .in("status", [
          "checked_in",
          "parked",
          "retrieval_requested",
          "retrieving"
        ]);

    if (activeSessionsError) {
      throw activeSessionsError;
    }

    // Pending retrievals
    const { count: pendingRetrievals, error: pendingRetrievalsError } =
      await supabase
        .from("parking_sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "retrieval_requested");

    if (pendingRetrievalsError) {
      throw pendingRetrievalsError;
    }

    // Today's revenue
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: todayPayments, error: paymentError } = await supabase
      .from("payments")
      .select("total_amount")
      .eq("payment_status", "paid")
      .gte("paid_at", startOfDay.toISOString());

    if (paymentError) {
      throw paymentError;
    }

    const todayRevenue = todayPayments.reduce(
      (total, payment) => total + Number(payment.total_amount || 0),
      0
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalSlots: totalSlots || 0,
        availableSlots: availableSlots || 0,
        occupiedSlots: occupiedSlots || 0,
        maintenanceSlots: maintenanceSlots || 0,
        activeSessions: activeSessions || 0,
        pendingRetrievals: pendingRetrievals || 0,
        todayRevenue
      }
    });
  } catch (error) {
    console.error("Parking Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Parking Admin dashboard statistics."
    });
  }
};

module.exports = {
  getParkingAdminDashboard
};