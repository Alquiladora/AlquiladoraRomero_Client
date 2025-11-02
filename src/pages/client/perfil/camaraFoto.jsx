import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';


const filters = [
  { name: 'none', label: 'Normal' },
  { name: 'grayscale', label: 'B&N' },
  { name: 'sepia', label: 'Sepia' },
  { name: 'contrast', label: 'Contraste' },
  { name: 'saturate', label: 'Saturado' },
];

const filterMap = {
  none: 'none',
  grayscale: 'grayscale(100%)',
  sepia: 'sepia(100%)',
  contrast: 'contrast(150%)',
  saturate: 'saturate(200%)',
};

const CameraModal = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('none');


  const stopCameraAndStream = () => {
    console.log('[CameraModal] Intentando apagar la cámara AHORA.');
    
 
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    

    if (videoRef.current) {
      videoRef.current.pause(); 
      videoRef.current.srcObject = null;
    }
  };


  const startCamera = async () => {
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      let errorMsg = 'No se pudo acceder a la cámara.';
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Permiso de cámara denegado. Revísalo en tu navegador.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No se encontró una cámara en este dispositivo.';
      }
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    startCamera();


    return () => {
      stopCameraAndStream();
    };
  }, []); 

  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    context.filter = filterMap[selectedFilter];
    context.save(); 
    context.translate(video.videoWidth, 0); 
    context.scale(-1, 1); 
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight); 
    context.restore();
    context.filter = 'none';
    
    canvas.toBlob(
      (blob) => {
        const file = new File([blob], 'captura-camara.jpg', {
          type: 'image/jpeg',
        });
        

        stopCameraAndStream(); 
        
        onCapture(file);
      },
      'image/jpeg',
      0.95
    );
  };

  const handleClose = () => {
 
    stopCameraAndStream(); 
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold dark:text-white">Tomar Foto</h3>
          
          <button
            onClick={handleClose} 
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 relative">
          {error ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-red-500">
              <p className="mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                <RefreshCw className="w-5 h-5" />
                Reintentar
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto rounded-lg"
              style={{
                transform: 'scaleX(-1)',
                filter: filterMap[selectedFilter], 
              }}
            />
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {!error && (
            <div className="flex justify-center space-x-2 mt-4 overflow-x-auto pb-2">
              {filters.map((filter) => (
                <button
                  key={filter.name}
                  onClick={() => setSelectedFilter(filter.name)}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedFilter === filter.name
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-center">
          <button
            onClick={handleCapture}
            disabled={!!error}
            className="p-4 bg-blue-600 rounded-full text-white shadow-lg transform transition-transform hover:scale-110 disabled:bg-gray-400"
            aria-label="Tomar foto"
          >
            <Camera className="w-8 h-8" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CameraModal;
