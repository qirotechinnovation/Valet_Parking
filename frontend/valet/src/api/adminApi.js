import apiClient from "./apiClient";

export const getDashboardStats = async () => {
  return apiClient("/api/admin/dashboard");
};