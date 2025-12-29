import axios from "axios";
import { LoginType } from "./types";
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  // baseURL: "/api",
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function login(payload: LoginType) {
  try {
    const res = await api.post("/login", payload);
    return res;
  } catch (error) {
    console.error("Error logging in (login): ", error);
  }
}
