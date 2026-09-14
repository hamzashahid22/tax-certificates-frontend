import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Users
export const getUsers = () => api.get("/users");
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Companies
export const getCompanies = () => api.get("/companies");

// Certificates
export const getCertificates = () => api.get("/certificates");
export const getCertificateById = (id) => api.get(`/certificates/${id}`);
export const createCertificate = (data) => api.post("/certificates", data);
export const updateCertificate = (id, data) => api.put(`/certificates/${id}`, data);
export const deleteCertificate = (id) => api.delete(`/certificates/${id}`);

export default api;