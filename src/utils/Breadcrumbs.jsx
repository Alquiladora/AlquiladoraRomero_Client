import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

const formatBreadcrumbName = (name) => {
  if (!name) return '';
  return name
    .replace(/-/g, ' ')

    .replace(/(?<!^)[A-Z]/g, ' $&')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const Breadcrumbs = () => {
  const location = useLocation();
  const params = useParams();

  const crumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);

    const roles = ['cliente', 'administrador', 'repartidor'];
    const rolePrefix = roles.includes(pathSegments[0]?.toLowerCase())
      ? pathSegments[0]
      : null;

    const relevantSegments = rolePrefix ? pathSegments.slice(1) : pathSegments;
    const basePath = rolePrefix ? `/${rolePrefix}` : '';

    if (params.idProducto && params.categori) {
      const categoryName = formatBreadcrumbName(params.categori);
      const combinedCategoryName = `Categoría ${categoryName}`;
      const categoryPath = `${basePath}/categoria/${params.categori}`;

      return [
        { name: combinedCategoryName, to: categoryPath },
        { name: 'Producto', to: location.pathname },
      ];
    }

    if (
      relevantSegments.length === 2 &&
      relevantSegments[0].toLowerCase() === 'categoria'
    ) {
      const categoryName = formatBreadcrumbName(relevantSegments[1]);
      const combinedCategoryName = `Categoría ${categoryName}`;

      return [{ name: combinedCategoryName, to: location.pathname }];
    }

    if (relevantSegments.includes('compra-exitosa')) {
        return [
            { name: 'Alquiler Confirmado', to: location.pathname }
        ];
    }

    let pathAccumulator = basePath;
    return relevantSegments.map((segment) => {
      pathAccumulator += `/${segment}`;
      const name = formatBreadcrumbName(segment);
      return { name, to: pathAccumulator };
    });
  }, [location.pathname, params]);

  if (crumbs.length === 0) return null;

  const homePath =
    location.pathname.split('/')[1] === 'cliente' ? '/cliente' : '/';

  return (
    <nav className="px-4 py-3 rounded-lg">
      <ol className="flex flex-wrap items-center text-sm font-medium">
        <li>
          <Link
            to={homePath}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <HomeIcon />
            <span className="ml-1">Inicio</span>
          </Link>
        </li>
        {crumbs.map((crumb) => {
          const isLast = crumb.to === location.pathname;

          return (
            <li key={crumb.to} className="flex items-center">
              <ChevronIcon />
              {isLast ? (
                <span className="font-bold text-gray-800">{crumb.name}</span>
              ) : (
                <Link
                  to={crumb.to}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const HomeIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);
const ChevronIcon = () => (
  <svg
    className="h-5 w-5 text-gray-400 mx-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

export default Breadcrumbs;
