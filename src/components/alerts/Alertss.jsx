import React from "react";

const Alert = ({ type, message, onClose }) => {
  let bgColor, textColor, borderColor;

  switch (type) {
    case "success":
      bgColor = "bg-green-100";
      textColor = "text-green-700";
      borderColor = "border-green-400";
      break;
    case "error":
      bgColor = "bg-red-100";
      textColor = "text-red-700";
      borderColor = "border-red-400";
      break;
    case "warning":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-700";
      borderColor = "border-yellow-400";
      break;
    case "info":
      bgColor = "bg-blue-100";
      textColor = "text-blue-700";
      borderColor = "border-blue-400";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-700";
      borderColor = "border-gray-400";
  }

  return (
    <div
      className={`${bgColor} ${textColor} border ${borderColor} px-4 py-3 rounded relative mb-4`}
      role="alert"
    >
      <span className="block sm:inline">{message}</span>
      <button
        onClick={onClose}
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
      >
        <svg
          className={`fill-current h-6 w-6 ${textColor}`}
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Cerrar</title>
          <path d="M14.348 14.849a1 1 0 01-1.414 0L10 11.414l-2.93 2.93a1 1 0 01-1.414-1.414l2.93-2.93-2.93-2.93a1 1 0 011.414-1.414l2.93 2.93 2.93-2.93a1 1 0 011.414 1.414l-2.93 2.93 2.93 2.93a1 1 0 010 1.414z" />
        </svg>
      </button>
    </div>
  );
};

export default Alert;