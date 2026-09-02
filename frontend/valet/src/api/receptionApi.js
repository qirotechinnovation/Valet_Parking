import apiClient from "./apiClient";

// ============================================================
// RECEPTION SESSIONS
// ============================================================

export const getReceptionSessions = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient(`/api/reception/sessions${query ? `?${query}` : ""}`);
};

export const createReceptionSession = async (sessionData) => {
  return apiClient("/api/reception/sessions", {
    method: "POST",
    body: JSON.stringify(sessionData),
  });
};

export const requestReceptionRetrieval = async (sessionId) => {
  return apiClient(`/api/reception/sessions/${sessionId}/request-retrieval`, {
    method: "PATCH",
  });
};

// ============================================================
// CUSTOMERS
// ============================================================

export const createCustomer = async (customerData) => {
  return apiClient("/api/customers", {
    method: "POST",
    body: JSON.stringify(customerData),
  });
};

export const getCustomers = async (search = "") => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiClient(`/api/customers${query}`);
};

// ============================================================
// VEHICLES
// ============================================================

export const createVehicle = async (vehicleData) => {
  return apiClient("/api/vehicles", {
    method: "POST",
    body: JSON.stringify(vehicleData),
  });
};

export const getVehicles = async (search = "") => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiClient(`/api/vehicles${query}`);
};
