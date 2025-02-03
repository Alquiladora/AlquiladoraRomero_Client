import React, { useContext } from "react";
import { ThemeContext } from "../../hooks/ContextThem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const ToggleThemeButton = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full focus:outline-none transition-all duration-300
        dark:bg-gray-800 dark:text-yellow-300 dark:hover:bg-gray-700 dark:hover:shadow-lg
        bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-md
        "
    >
      {/* Ícono dinámico con animación */}
      <FontAwesomeIcon
        icon={theme === "light" ? faMoon : faSun}
        className={`w-6 h-6 transform transition-transform duration-300 ${
          theme === "light" ? "rotate-0" : "rotate-180"
        } hover:scale-110`}
      />
    </button>
  );
};

export default ToggleThemeButton;