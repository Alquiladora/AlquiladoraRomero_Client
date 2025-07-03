import React, { useState, useEffect } from "react";
import { KeyRound, Loader2, Copy, RefreshCw } from "lucide-react";
import api from "../../utils/AxiosConfig";

const Notification = ({ message, type, onClose }) => (
  <div
    className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-xs animate-slide-in ${
      type === "success"
        ? "bg-green-50 dark:bg-green-800 text-green-800 dark:text-green-100"
        : "bg-red-50 dark:bg-red-800 text-red-800 dark:text-red-100"
    }`}
  >
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-lg font-bold hover:text-gray-900 dark:hover:text-gray-200"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  </div>
);

const WearOsTokenView = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [spinning, setSpinning] = useState(false);

  // Fetch the global WearOS token
  const fetchToken = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/wearos/wearos/token", { withCredentials: true });
      setToken(res.data?.token || "");
      setNotification({ message: "Token retrieved successfully", type: "success" });
    } catch (err) {
      setNotification({ message: "Failed to retrieve token", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Refresh the global WearOS token
  const refreshToken = async () => {
    setLoading(true);
    setSpinning(true);
    try {
      const res = await api.post("/api/wearos/wearos/token/update", {}, { withCredentials: true });
      setToken(res.data?.token || "");
      setNotification({ message: "Token refreshed successfully", type: "success" });
    } catch (err) {
      setNotification({ message: "Failed to refresh token", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setSpinning(false), 900);
    }
  };

  useEffect(() => {
    fetchToken();
    // eslint-disable-next-line
  }, []);

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setNotification({ message: "Token copied to clipboard", type: "success" });
      setTimeout(() => setNotification(null), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center  min-h-screen  dark:bg-gray-900 transition-colors duration-300 px-4 py-8">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full shadow-sm mb-3">
            <KeyRound className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 tracking-tight">
            Wear OS Token
          </h2>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
           Inicia sesion con el token
          </span>
        </div>

        <div className="w-full mb-6">
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 transition-all duration-300 shadow-sm">
            <input
              type="text"
              value={loading ? "Fetching token..." : token}
              className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 font-mono truncate"
              readOnly
              aria-label="Wear OS token"
            />
            <button
              onClick={handleCopyToken}
              className="ml-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Copy token"
              disabled={loading}
              aria-label="Copy token to clipboard"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          onClick={refreshToken}
          className="w-full py-2.5 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg font-semibold text-sm sm:text-base hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-all duration-200 flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={loading}
          aria-label="Refresh token"
        >
          {loading || spinning ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <RefreshCw
              className={`w-5 h-5 mr-2 transition-transform duration-500 ${spinning ? "animate-spin" : ""}`}
            />
          )}
          {loading ? "Refreshing..." : "Refresh Token"}
        </button>
      </div>
      {/* Custom Animations */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slide-in {
          animation: slideIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default WearOsTokenView;