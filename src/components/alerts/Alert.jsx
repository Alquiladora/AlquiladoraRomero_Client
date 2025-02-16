import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export const showAlert = (type, message, duration = 5000) => {
  Swal.fire({
    toast: true,
    position: "top-end", 
    icon: type, 
    title: message,
    showConfirmButton: false, 
    timer: duration, 
    timerProgressBar: true, 

    // 📌 Diseño mejorado con Tailwind + Soporte para modo oscuro
    customClass: {
      popup: `rounded-lg shadow-lg text-lg font-medium 
        ${type === "error" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : ""}
        ${type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
        ${type === "info" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : ""}
        ${type === "warning" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : ""}`
    }
  });
};
