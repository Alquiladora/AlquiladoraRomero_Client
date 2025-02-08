import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion"; // Animaciones suaves

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        <li>
          <Link
            to="/"
            className="text-blue-600 font-medium hover:text-blue-800 transition-colors duration-300"
          >
            Inicio
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={to} className="flex items-center">
              {/* Separador con animación */}
              <motion.span
                className="mx-2 text-gray-400"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                &gt;
              </motion.span>

              {/* Enlace con efecto hover */}
              <Link
                to={to}
                className={`capitalize ${
                  isLast
                    ? "text-gray-700  text-gray-900 dark:text-white font-semibold"
                    : "text-blue-600 font-medium hover:text-blue-800 transition-colors duration-300"
                }`}
              >
                {decodeURIComponent(value)}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
