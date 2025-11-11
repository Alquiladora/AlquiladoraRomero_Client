import React from 'react';
import { motion } from 'framer-motion';
import uthh from '../../../img/Clientes/uthh.png';
import atlapexco from '../../../img/Clientes/atlapexco.jpeg'
import huejutla from '../../../img/Clientes/huejutla.webp'
import huaeh from '../../../img/Clientes/huaeh.jpg';
import poli from '../../../img/Clientes/poli.jpeg';
import ithh from '../../../img/Clientes/ithh.webp'

const ClientDestacados = () => {
 
  const clients = [
    { 
      id: 1, 
      name: 'UTHH', 
      description: 'Universidad Tecnológica de la Huasteca Hidalguense',
      logo: uthh 
    },
    { 
      id: 2, 
      name: 'Presidencia Municipal de Huejutla', 
      description: 'Gobierno Municipal',
      logo: huejutla
    },
    { 
      id: 3, 
      name: 'Presidencia de Atlapexco', 
      description: 'Gobierno Municipal',
      logo:  atlapexco
    },
    { 
      id: 4, 
      name: 'La Politécnica', 
      description: 'Universidad Politécnico de Huejutla',
      logo: poli
    },
    { 
      id: 5, 
      name: 'UAEH', 
      description: 'Universidad Autónoma del Estado de Hidalgo',
      logo:huaeh
    },
    { 
      id: 6, 
      name: 'ITHH', 
      description: 'Instituto Tecnológico de Huejutla',
      logo: ithh
    },
  ];

  return (
    <div className="flex flex-col justify-center items-center w-full px-4 sm:px-8 lg:px-16 mt-8 mb-8">
      <motion.h2 
        className="text-4xl font-bold text-center mb-8 text-[#fcb900]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Clientes Destacados
      </motion.h2>


      <motion.div
        className="w-full max-w-6xl"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >

        <div className="hidden lg:grid grid-cols-6 gap-6">
          {clients.map((client, index) => (
            <motion.div
              key={client.id}
              className="flex flex-col items-center group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
         
              <motion.div
                className="w-24 h-24 bg-white rounded-[50%] shadow-md flex items-center justify-center p-2 mb-3 group-hover:shadow-xl transition-all duration-300 border border-gray-200"
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
                }}
              >
                <img 
                  src={client.logo} 
                  alt={`Logo ${client.name}`}
                  className="w-full h-full object-contain rounded-[50%]"
                  onError={(e) => {
                 
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
       
                <div 
                  className="hidden w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-[50%] items-center justify-center text-white font-bold text-lg"
                >
                  {client.name.split(' ').map(word => word[0]).join('')}
                </div>
              </motion.div>
              
           
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 text-base group-hover:text-[#fcb900] transition-colors duration-300">
                  {client.name}
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  {client.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

    
        <div className="hidden md:flex lg:hidden gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {clients.map((client, index) => (
            <motion.div
              key={client.id}
              className="flex flex-col items-center group flex-shrink-0 w-32"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className="w-20 h-20 rounded-[50%] shadow-md flex items-center justify-center p-2 mb-3 group-hover:shadow-xl transition-all duration-300 border border-gray-200"
                whileHover={{ 
                  scale: 1.05,
                  y: -5
                }}
              >
                <img 
                  src={client.logo} 
                  alt={`Logo ${client.name}`}
                  className="w-full h-full object-contain rounded-[50%]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-[50%] items-center justify-center text-white font-bold text-base">
                  {client.name.split(' ').map(word => word[0]).join('')}
                </div>
              </motion.div>
              
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 text-sm group-hover:text-[#fcb900] transition-colors duration-300">
                  {client.name.split(' ')[0]}
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  {client.description.split(' ')[0]}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

 
        <div className="flex md:hidden gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2">
          {clients.map((client, index) => (
            <motion.div
              key={client.id}
              className="flex flex-col items-center group flex-shrink-0 w-28"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className="w-16 h-16  rounded-[50%] shadow-md flex items-center justify-center p-1 mb-2 group-hover:shadow-xl transition-all duration-300 border border-gray-200"
                whileHover={{ 
                  scale: 1.05,
                  y: -3
                }}
              >
                <img 
                  src={client.logo} 
                  alt={`Logo ${client.name}`}
                  className="w-full h-full object-contain rounded-[50%]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-[50%] items-center justify-center text-white font-bold text-sm">
                  {client.name.split(' ').map(word => word[0]).join('')}
                </div>
              </motion.div>
              
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 text-xs group-hover:text-[#fcb900] transition-colors duration-300 leading-tight">
                  {client.name.split(' ')[0]}
                </h3>
                <p className="text-gray-500 text-[10px] mt-1 leading-tight">
                  {client.description.split(' ')[0]}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ClientDestacados;