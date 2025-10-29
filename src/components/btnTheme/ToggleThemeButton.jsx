import React, { useContext } from 'react';
import { ThemeContext } from '../../hooks/ContextThem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

const ToggleThemeButton = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center justify-center
        w-10 h-10
        rounded-full
        focus:outline-none
        focus:ring-4 focus:ring-yellow-300
        transition-all duration-300
        hover:scale-105 hover:shadow-md active:scale-95
        ${isLight ? 'bg-gray-200 text-gray-800' : 'bg-gray-700 text-yellow-300'}
      `}
    >
      <FontAwesomeIcon
        icon={isLight ? faMoon : faSun}
        className={`
          w-5 h-5
          transform
          transition-transform
          duration-300
          ${isLight ? 'rotate-0' : 'rotate-180'}
        `}
      />
    </button>
  );
};

export default ToggleThemeButton;
