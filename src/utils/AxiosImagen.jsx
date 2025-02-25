import axios from "axios";

const apiImagen = axios.create({
    baseURL: "http://localhost:3001",
  timeout: 60000, 
  withCredentials: true,
});

export default apiImagen;
