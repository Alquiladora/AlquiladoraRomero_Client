import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const ClientDestacados = () => {
    const clients = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Cliente ${i + 1}`,
        description: `Descripción ${i + 1}`
    }));

    const [currentPage, setCurrentPage] = useState(1);
    const clientsPerPage = 6;

    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = clients.slice(indexOfFirstClient, indexOfLastClient);

    const nextPage = () => {
        if (currentPage < Math.ceil(clients.length / clientsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const containerControls = useAnimation();

    useEffect(() => {
        containerControls.start({
          opacity: 1,
          x: 0,
          transition: { duration: 0.5 }
        });
      }, [containerControls]);


    return (
        <div className="flex flex-col justify-center items-center w-full px-4 sm:px-8 lg:px-16  mt-2">
            <h2 className="text-4xl font-bold text-center mb-6 text-[#fcb900]">Clientes Destacados</h2>

            {/* Contenedor de clientes con scroll solo en pantallas pequeñas */}
            <motion.div
                className="w-full flex justify-center"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex gap-4 overflow-x-auto sm:overflow-visible scrollbar-hide sm:scrollbar-default">
                    {currentClients.map((client) => (
                        <motion.div
                            key={client.id}
                            className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-md flex flex-col justify-center items-center cursor-pointer p-2 text-center"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <h3 className="text-xs font-semibold text-white truncate w-full">{client.name}</h3>
                            <p className="text-[10px] text-gray-200 truncate w-full">{client.description}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Paginación */}
            <div className="flex justify-center gap-2 mt-4 text-sm">
                <button
                    onClick={prevPage}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-700 disabled:opacity-50"
                    disabled={currentPage === 1}
                >
                    Anterior
                </button>
                <span className="flex items-center">
                    Página {currentPage} de {Math.ceil(clients.length / clientsPerPage)}
                </span>
                <button
                    onClick={nextPage}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-700 disabled:opacity-50"
                    disabled={currentPage === Math.ceil(clients.length / clientsPerPage)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default ClientDestacados;
