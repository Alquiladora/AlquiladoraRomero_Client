import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';

mapboxgl.accessToken =
  'pk.eyJ1IjoiZWRpbGJlcnRvMTIzIiwiYSI6ImNseTN3cWUxZzBkajUyanBvZHR0MjVsdXUifQ.U5EAmb6GXJOArRN9kAy0kg';

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapStyle, setMapStyle] = useState(
    'mapbox://styles/mapbox/streets-v12'
  );
  const [loading, setLoading] = useState(true);

  const longitude = -98.4251106;
  const latitude = 21.1456417;

  const googleMapsLink =
    'https://www.google.com/maps/place/Alquiladora+Romero/@21.1455757,-98.4249915,92m/data=!3m1!1e3!4m6!3m5!1s0x85d726e9e1ec5935:0x457af38d8c7157b7!8m2!3d21.1456417!4d-98.4251106!16s%2Fg%2F11gdz6y3yh?entry=ttu&g_ep=EgoyMDI1MDMwNC4wIKXMDSoASAFQAw%3D%3D';

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [longitude, latitude],
        zoom: 15,
      });

      new mapboxgl.Marker({ color: '#ff5733' })
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 30 }).setHTML(`
            <div style="max-width: 200px; padding: 15px; background-color: #fff; border-radius: 20px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;">
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
        map.current.flyTo({ center: [longitude, latitude], zoom: 16 });
      });
    } else {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle, latitude, longitude]);

  const handleMapStyleToggle = () => {
    setMapStyle((prevStyle) =>
      prevStyle === 'mapbox://styles/mapbox/streets-v12'
        ? 'mapbox://styles/mapbox/satellite-v9'
        : 'mapbox://styles/mapbox/streets-v12'
    );
  };

  return (
    <div className="relative w-full mb-4 md:mb-0">
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-10 text-center text-white">
        <h3 className="text-4xl md:text-5xl font-extrabold text-[#fcb900]">
          Ubicación
        </h3>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-gray-700 bg-opacity-50 flex flex-col items-center justify-center z-20">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
          <div className="mt-2 text-white font-semibold text-lg">
            Cargando...
          </div>
        </div>
      )}

      <motion.div
        className="rounded-xl shadow-lg overflow-hidden border border-gray-400"
        ref={mapContainer}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        style={{ height: '400px' }}
      />

      <div className="absolute top-4 left-4 z-10">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition text-sm"
          onClick={handleMapStyleToggle}
        >
          Cambiar Mapa
        </button>
      </div>

      <div className="flex flex-col items-center mt-6">
        <p className="text-sm md:text-base lg:text-lg text-white mb-2">
          Dirección:{' '}
          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Tahuitzan, Huejuta de Reyes, Hidalgo
          </a>
        </p>

        <div className="flex gap-4">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${latitude}%2C${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition text-sm md:text-base"
          >
            <MapPin className="w-4 h-4 md:w-5 md:h-5" />
            Cómo llegar
          </a>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
