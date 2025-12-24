import axios from "axios";
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
// console.log(baseURL, "baseURL");

const api = axios.create({
  // baseURL: "/api",
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function login(payload) {
  try {
    const res = await api.post("/login", payload);
    console.log(res, "res: login");
  } catch (error) {
    console.error("Error logging in (login): ", error);
  }
}
