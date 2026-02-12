import axios from "axios";

// Base URL configurable via variable d'environnement, fallback localhost pour le dev
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});


