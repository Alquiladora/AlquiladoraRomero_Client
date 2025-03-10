import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Typography } from '@mui/material';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWRpbGJlcnRvMTIzIiwiYSI6ImNseTN3cWUxZzBkajUyanBvZHR0MjVsdXUifQ.U5EAmb6GXJOArRN9kAy0kg'; // Reemplaza con tu clave de API de Mapbox

const MapWithPostalCode = ({ postalCode, currentState, currentMunicipio, currentLocalidad }) => {
  const [position, setPosition] = useState(null);
  const [viewState, setViewState] = useState({
    latitude: 19.4326,
    longitude: -99.1332,
    zoom: 13,
  });
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    if (postalCode && currentState && currentMunicipio && currentLocalidad) {
      const fetchCoordinates = async () => {
        try {
          const query = `${currentLocalidad}, ${currentMunicipio}, ${currentState}, ${postalCode}, MX`;
          const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}`);
          if (response.data && response.data.features && response.data.features.length > 0) {
            const { center } = response.data.features[0];
            const [lon, lat] = center;
            setPosition([lat, lon]);
            setViewState({
              latitude: lat,
              longitude: lon,
              zoom: 13,
            });
          } else {
            console.error("No precise location found for this query.");
          }
        } catch (error) {
          console.error("Error fetching location data: ", error);
        }
      };
      fetchCoordinates();
    }
  }, [postalCode, currentState, currentMunicipio, currentLocalidad]);

  
  return (
    <>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '400px' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {position && (
          <Marker latitude={position[0]} longitude={position[1]}>
            <div onClick={() => setShowPopup(true)}>
              <FaMapMarkerAlt style={{ color: 'red', fontSize: '24px' }} />
            </div>
            {showPopup && (
              <Popup
                latitude={position[0]}
                longitude={position[1]}
                onClose={() => setShowPopup(false)}
                closeOnClick={true}
              >
                Tu ubicación es: <br /> {currentLocalidad}, {currentMunicipio}, {currentState}
              </Popup>
            )}
          </Marker>
        )}
        <NavigationControl position="top-left" />
      </Map>
      <Typography
        variant="caption"
        display="block"
        gutterBottom
        style={{
          textAlign: 'center',
          marginTop: '10px',
          fontWeight: 'bold',
        }}
      >
        La ubicación mostrada puede no ser exacta.
      </Typography>
    </>
  );
};

export { MapWithPostalCode };
