// TiltImage.jsx
import React, { useRef, useEffect } from "react";
import VanillaTilt from "vanilla-tilt";

function TiltImage({ src, alt, options = {}, className = "" }) {
  const tiltRef = useRef(null);

  useEffect(() => {
    if (!tiltRef.current) return;

    // Inicializamos VanillaTilt
    VanillaTilt.init(tiltRef.current, {
      max: 15,
      speed: 400,
      glare: true,
      "max-glare": 0.4,
      ...options,
    });

    // Al desmontar, verificamos antes de destruir
    return () => {
      if (tiltRef.current && tiltRef.current.vanillaTilt) {
        tiltRef.current.vanillaTilt.destroy();
      }
    };
  }, [options]);

  return (
    <div ref={tiltRef} className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover rounded-md"
      />
    </div>
  );
}

export default TiltImage;
