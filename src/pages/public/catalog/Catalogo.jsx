import { Link } from 'react-router-dom';

const CatalogoSillas = () => {
  const sillas = [
    {
      id: 1,
      name: 'Silla de Oficina',
      description: 'Silla ergonómica de oficina, cómoda y resistente.',
      price: 250,
      image: 'https://via.placeholder.com/150/0000FF/808080?text=Silla+Oficina', // Imagen de ejemplo
    },
    {
      id: 2,
      name: 'Silla de Comedor',
      description: 'Silla moderna para comedor con diseño elegante.',
      price: 150,
      image: 'https://via.placeholder.com/150/FF6347/FFFFFF?text=Silla+Comedor', // Imagen de ejemplo
    },
    {
      id: 3,
      name: 'Silla Gamer',
      description: 'Silla ergonómica para gamers, con soporte lumbar.',
      price: 500,
      image: 'https://via.placeholder.com/150/32CD32/FFFFFF?text=Silla+Gamer', // Imagen de ejemplo
    },
    {
      id: 4,
      name: 'Silla de Playa',
      description: 'Silla plegable ideal para la playa, fácil de transportar.',
      price: 100,
      image: 'https://via.placeholder.com/150/FFD700/FFFFFF?text=Silla+Playa', // Imagen de ejemplo
    },
  ];

  return (
    <div className="catalogo-container py-6 px-4 dark:bg-gray-950 dark:text-white">
      {/* Migas de pan */}
      <nav className="mb-6 text-lg">
        <ul className="flex space-x-2">
          <li>
            <Link to="/" className="text-blue-500 hover:underline">
              Home
            </Link>
          </li>

          <li>/</li>
          <li className="text-gray-600">Categoria-Silla</li>
        </ul>
      </nav>

      <h2 className="text-4xl font-bold text-[#fcb900] text-center mb-6">
        Catálogo de Sillas
      </h2>

      <div className="productos grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {sillas.map((product) => (
          <div
            key={product.id}
            className="producto border p-4 rounded-lg shadow-md"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover rounded-lg"
            />
            <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.description}</p>
            <p className="text-xl font-bold mt-2">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogoSillas;
