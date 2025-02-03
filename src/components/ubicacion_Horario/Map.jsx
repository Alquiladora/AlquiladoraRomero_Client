import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';

mapboxgl.accessToken = 'pk.eyJ1IjoiZWRpbGJlcnRvMTIzIiwiYSI6ImNseTN3cWUxZzBkajUyanBvZHR0MjVsdXUifQ.U5EAmb6GXJOArRN9kAy0kg';

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [-98.4251106, 21.1456417],
        zoom: 15,
      });

      // Crear el ícono del marcador con color personalizado
      const marker = new mapboxgl.Marker({
        color: "#ff5733"
      })
        .setLngLat([-98.4251106, 21.1456417])
        .setPopup(new mapboxgl.Popup({ offset: 30 })
        .setHTML(`
            <div style="max-width: 200px; padding: 15px; background-color:rgb(255, 255, 255); border-radius: 20px;  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <!-- Triángulo que simula la punta de la burbuja -->
              <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 10px solid #f0f0f0;"></div>
              
              <!-- Título de la burbuja -->
              <div style="font-size: 14px; color: #333; font-weight: bold; margin-bottom: 10px; text-align: center;">
                <strong>Alquiladora Romero</strong>
              </div>
              
              <!-- Información de la ubicación centrada -->
              <div style="font-size: 13px; color: #555; line-height: 1.6; text-align: center;">
                <strong>Ubicación:</strong><br />
                Tahuitzan, Huejuta de Reyes, Hidalgo
              </div>
            </div>
          `)
        )
        .addTo(map.current);

      map.current.on('load', () => {
        setLoading(false);
        map.current.flyTo({ center: [-98.4251106, 21.1456417], zoom: 16 });
      });
    } else {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle]);

  return (
    <div className="relative w-full mb- md:mb-0">
       {/* Título y descripción centrada en la parte superior del mapa */}
       <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-10 text-center text-white">
        <h3 className="text-lg font-bold text-4xl text-[#fcb900] font-bold">Ubicación</h3>
      </div>

      {/* Slider de carga */}
      {loading && (
        <div className="absolute inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center z-20">
          <div className="text-white">Cargando...</div>
        </div>
      )}

      {/* Contenedor del mapa */}
      <motion.div 
        className="rounded-xl shadow-lg overflow-hidden border border-gray-400" 
        ref={mapContainer} 
        initial={{ opacity: 0, x: -50 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.8 }}
        style={{ height: '400px' }} 
      />

    

      {/* Información detallada debajo del mapa */}
      <div className="flex flex-col items-center mt-4">
        <p className="text-sm text-white">Tahuitzan, Huejuta de Reyes, Hidalgo</p>
      </div>

      <div className="absolute top-4 left-4 z-10">
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition text-sm"
          onClick={() => setMapStyle(prevStyle => 
            prevStyle === 'mapbox://styles/mapbox/streets-v12' ? 'mapbox://styles/mapbox/satellite-v9' : 'mapbox://styles/mapbox/streets-v12'
          )}
        >
          Cambiar Mapa
        </button>
      </div>
    </div>
  );
};

export default MapComponent;
