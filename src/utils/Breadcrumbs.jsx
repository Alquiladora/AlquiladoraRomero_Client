import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/ContextAuth";

const Breadcrumbs = () => {
  const location = useLocation();
  const { user } = useAuth();

  const getFilteredPathnames = () => {
    const rawPathnames = location.pathname.split("/").filter(Boolean);

    if (user?.rol && ["cliente", "administrador", "repartidor"].includes(user.rol)) {
      return rawPathnames.slice(1);
    }

    return rawPathnames;
  };

  const pathnames = getFilteredPathnames();

  const formatBreadcrumbName = (name) => {
    return name
      .replace(/[-_]/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  );

  const ChevronIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <nav className="py-4">
      <ol className="flex flex-wrap items-center text-sm font-medium">
        <li>
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300">
            <HomeIcon />
            <span>Inicio</span>
          </Link>
        </li>

        {pathnames.map((value, index) => {
          const isLast = index === pathnames.length - 1;
          const displayPathnames = pathnames.slice(0, index + 1);
          const basePath = user?.rol && ["cliente", "administrador", "repartidor"].includes(user.rol)
            ? `/${user.rol}`
            : "";
          const to = `${basePath}/${displayPathnames.join("/")}`;

          return (
            <li key={to} className="flex items-center">
              <motion.div className="mx-2 text-gray-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <ChevronIcon />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                {isLast ? (
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {formatBreadcrumbName(value)}
                  </span>
                ) : (
                  <Link to={to} className="text-blue-600 hover:text-blue-800 transition-colors duration-300">
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

export default Breadcrumbs;
