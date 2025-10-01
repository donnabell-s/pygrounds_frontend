import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const getReadingMaterials = async () => {
  return await axios.get(`${API_BASE_URL}/api/reading/admin/materials/`);
};
