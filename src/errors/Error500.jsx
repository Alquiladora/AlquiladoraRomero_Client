import { Link } from "react-router-dom";

const Error500 = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold text-red-600">500</h1>
      <p className="text-xl mt-4 text-gray-700">Error interno del servidor</p>
      <p className="text-gray-500 mt-2">Lo sentimos, algo salió mal.</p>
      <Link to="/" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Volver al Inicio
      </Link>
    </div>
  );
};

export default Error500;
