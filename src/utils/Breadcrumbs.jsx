import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/ContextAuth";
import { useMemo } from "react";

const Breadcrumbs = () => {
  const location = useLocation();
  const { user } = useAuth();

 
  const pathnames = useMemo(() => {
    const rawPathnames = location.pathname.split("/").filter(Boolean);
    return user?.rol && ["cliente", "administrador", "repartidor"].includes(user.rol)
      ? rawPathnames.slice(1)
      : rawPathnames;
  }, [location.pathname, user?.rol]);

 
  const formatBreadcrumbName = (name) =>
    name.replace(/[-_]/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <nav className=" dark:bg-gray-900px-4 py-3 rounded-lg ">
      <ol className="flex flex-wrap items-center text-sm font-medium text-gray-600 dark:text-gray-300">
    
        <li>
          <Link
            to="/"
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300"
          >
            <HomeIcon />
            <span className="ml-1">Inicio</span>
          </Link>
        </li>

      
        {pathnames.map((value, index) => {
          const isLast = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;

          return (
            <li key={to} className="flex items-center">
          
              <motion.div
                className="mx-2 text-gray-400 dark:text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronIcon />
              </motion.div>

             
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                exit={{ opacity: 0 }}
              >
                {isLast ? (
                  <span className="text-gray-900 dark:text-white font-bold">
                    {formatBreadcrumbName(value)}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300"
                  >
                    {formatBreadcrumbName(value)}
                  </Link>
                )}
              </motion.div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);


const ChevronIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default Breadcrumbs;
