import apiClient from "./client";

export async function getAdminUsers() {
  const response = await apiClient.get("/admin/users");
  return response.data;
}

export async function getAdminUser(userId) {
  const response = await apiClient.get(`/admin/users/${userId}`);
  return response.data;
}

export async function resetAdminUserPassword(userId, password) {
  const response = await apiClient.patch(`/admin/users/${userId}/password`, { password });
  return response.data;
}
