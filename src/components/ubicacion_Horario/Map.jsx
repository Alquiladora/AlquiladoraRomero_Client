import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';
import { MapPin, Loader2, Navigation } from 'lucide-react';


mapboxgl.accessToken = 'pk.eyJ1IjoiZWRpbGJlcnRvMTIzIiwiYSI6ImNseTN3cWUxZzBkajUyanBvZHR0MjVsdXUifQ.U5EAmb6GXJOArRN9kAy0kg';

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const longitude = -98.4251106;
  const latitude = 21.1456417;

  const googleMapsLink = 'https://www.google.com/maps/place/Alquiladora+Romero/@21.1455757,-98.4249915,92m/data=!3m1!1e3!4m6!3m5!1s0x85d726e9e1ec5935:0x457af38d8c7157b7!8m2!3d21.1456417!4d-98.4251106!16s%2Fg%2F11gdz6y3yh?entry=ttu&g_ep=EgoyMDI1MDMwNC4wIKXMDSoASAFQAw%3D%3D';

  useEffect(() => {
    if (!mapContainer.current) return;

    let isCancelled = false;


    const checkToken = async () => {
      try {
        const response = await fetch(`https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=${mapboxgl.accessToken}`);
        if (!response.ok) {
          throw new Error('Token de Mapbox inválido');
        }
      } catch (err) {
        setError('Error de configuración del mapa');
        setLoading(false);
        return false;
      }
      return true;
    };

    const initializeMap = async () => {
      const tokenValid = await checkToken();
      if (!tokenValid || isCancelled) return;

      try {
        if (isCancelled || !mapContainer.current) return;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: mapStyle,
          center: [longitude, latitude],
          zoom: 14,
          attributionControl: false,
          failIfMajorPerformanceCaveat: false,
        });


        map.current.on('error', (e) => {
          if (isCancelled) return;
          setError('Error al cargar el mapa');
          setLoading(false);
        });

        map.current.on('load', () => {
          if (isCancelled) return;
          setLoading(false);
          setError(null);

          new mapboxgl.Marker({
            color: '#ff5733',
            scale: 0.8
          })
            .setLngLat([longitude, latitude])
            .setPopup(
              new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
                closeOnClick: false
              }).setHTML(`
                <div style="max-width: 200px; padding: 12px;">
                  <div style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px; text-align: center;">
                    Alquiladora Romero
                  </div>
                  <div style="font-size: 12px; color: #555; line-height: 1.4; text-align: center;">
                    Tahuitzan, Huejuta de Reyes, Hidalgo
                  </div>
                </div>
              `)
            )
            .addTo(map.current);


          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            duration: 3000,
            essential: true
          });
        });


        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      } catch (err) {
        if (isCancelled) return;
        console.error('Error al inicializar el mapa:', err);
        setError('No se pudo cargar el mapa');
        setLoading(false);
      }
    };

    initializeMap();


    return () => {
      isCancelled = true;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);


  useEffect(() => {
    if (map.current && !loading && !error) {
      try {
        map.current.setStyle(mapStyle);
      } catch (err) {
        console.error('Error al cambiar estilo:', err);
        setError('Error al cambiar vista del mapa');
      }
    }
  }, [mapStyle, loading, error]);

  const handleMapStyleToggle = () => {
    setMapStyle((prevStyle) =>
      prevStyle === 'mapbox://styles/mapbox/streets-v11'
        ? 'mapbox://styles/mapbox/satellite-streets-v11'
        : 'mapbox://styles/mapbox/streets-v11'
    );
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  return (
    <div className="relative w-full mb-4 md:mb-0  rounded-xl p-4">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 text-center">
        <h3 className="text-3xl md:text-4xl font-bold text-[#fcb900] drop-shadow-lg">
          Ubicación
        </h3>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-90 flex flex-col items-center justify-center z-20 rounded-xl">
          <Loader2 className="w-12 h-12 text-[#fcb900] animate-spin mb-4" />
          <div className="text-white font-semibold text-lg">Cargando mapa...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-90 flex flex-col items-center justify-center z-20 rounded-xl">
          <div className="text-red-400 text-lg font-semibold mb-4">{error}</div>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-[#fcb900] text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Reintentar
          </button>
          <p className="text-white text-sm mt-4 text-center">
            O visita nuestra ubicación en{' '}
            <a
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#fcb900] underline"
            >
              Google Maps
            </a>
          </p>
        </div>
      )}

      <motion.div
        className="rounded-lg shadow-2xl overflow-hidden border-2 border-gray-600"
        ref={mapContainer}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ height: '400px', width: '100%' }}
      />

      <div className="absolute top-20 right-4 z-10 flex flex-col gap-2">
        <button
          className="px-4 py-2 bg-white text-gray-800 rounded-lg shadow-lg hover:bg-gray-100 transition-all text-sm font-semibold border border-gray-300"
          onClick={handleMapStyleToggle}
        >
          {mapStyle.includes('satellite') ? 'Mapa' : 'Satélite'}
        </button>
      </div>

      <div className="flex flex-col items-center mt-6 space-y-3">
        <p className="text-white text-center text-sm md:text-base">
          📍{' '}
          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#fcb900] hover:underline font-medium"
          >
            Tahuitzan, Huejuta de Reyes, Hidalgo
          </a>
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#fcb900] text-gray-900 rounded-lg shadow-lg hover:bg-yellow-500 transition-all font-semibold text-sm md:text-base"
          >
            <Navigation className="w-4 h-4 md:w-5 md:h-5" />
            Cómo llegar
          </a>

          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all font-semibold text-sm md:text-base"
          >
            <MapPin className="w-4 h-4 md:w-5 md:h-5" />
            Ver en Maps
          </a>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;