import apiClient from "./client";

export async function registerAccount(data) {
  const response = await apiClient.post("/auth/register", data);
  return response.data.user;
}

export async function loginAccount(data) {
  const response = await apiClient.post("/auth/login", data);
  return response.data.user;
}

export async function getCurrentUser() {
  const response = await apiClient.get("/auth/me");
  return response.data.user;
}

export async function logoutAccount() {
  await apiClient.post("/auth/logout");
}

export async function changeAccountPassword(currentPassword, newPassword) {
  const response = await apiClient.patch("/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data;
}

export async function changePasswordWithCredentials(email, currentPassword, newPassword) {
  const response = await apiClient.patch("/auth/change-password-with-credentials", {
    email,
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data;
}
