import axios from "axios";
import { clearAuthStorage, getStoredToken } from "../utils/authStorage";

const API_BASE_URL = "http://localhost:8081/resources";

const API = axios.create({

 baseURL: API_BASE_URL

});

API.interceptors.request.use((req)=>{
 const token = getStoredToken();

 if(token){
  req.headers.Authorization = `Bearer ${token}`;
 }

 return req;
});

API.interceptors.response.use(
 (response) => response,
 (error) => {
  if (error.response?.status === 401) {
   clearAuthStorage();
  }

  const message =
   error?.response?.data?.message ||
   error?.response?.data?.error ||
   error?.message ||
   "Request failed";

  error.userMessage = message;
  return Promise.reject(error);
 }
);

export default API;