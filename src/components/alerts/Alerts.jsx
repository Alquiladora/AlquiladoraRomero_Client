import React, { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';

// Componente para alertas de éxito
export const AlertSuccess = ({ message, onClose }) => {
  const MySwal = withReactContent(Swal);
  MySwal.fire({
    icon: 'success',
    title: <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />,
    text: message,
    showConfirmButton: false,
    timer: 3000,
    willClose: onClose,
    customClass: {
      popup: 'small-alert',
      title: 'alert-icon',
      content: 'alert-content',
    },
  });
  return null;
};

// Componente para alertas de error
export const AlertError = ({ message, onClose }) => {
  const MySwal = withReactContent(Swal);
  MySwal.fire({
    icon: 'error',
    title: (
      <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500" />
    ),
    text: message,
    showConfirmButton: false,
    timer: 3000,
    willClose: onClose,
    customClass: {
      popup: 'small-alert',
      title: 'alert-icon',
      content: 'alert-content',
    },
  });
  return null;
};

// Componente para alertas de información
export const AlertInfo = ({ message, onClose }) => {
  const MySwal = withReactContent(Swal);
  MySwal.fire({
    icon: 'info',
    title: <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />,
    text: message,
    showConfirmButton: false,
    timer: 3000,
    willClose: onClose,
    customClass: {
      popup: 'small-alert',
      title: 'alert-icon',
      content: 'alert-content',
    },
  });
  return null;
};

// Hook para manejar las alertas con animaciones
export const useAlert = () => {
  const [alert, setAlert] = useState(null);

  const showAlert = (type, message, duration = 3000) => {
    const onClose = () => {
      setAlert(null);
    };

    let alertComponent;
    switch (type) {
      case 'success':
        alertComponent = <AlertSuccess message={message} onClose={onClose} />;
        break;
      case 'error':
        alertComponent = <AlertError message={message} onClose={onClose} />;
        break;
      case 'info':
        alertComponent = <AlertInfo message={message} onClose={onClose} />;
        break;
      default:
        return;
    }

    setAlert(alertComponent);

    // Cerrar automáticamente después del tiempo especificado
    if (duration) {
      setTimeout(onClose, duration);
    }
  };

  return {
    alert,
    showAlert,
  };
};

// Añade estilos personalizados para las alertas
const styles = `
  .small-alert {
    width: 250px !important;
    padding: 0px !important;
    left: 2px !important;
    right: 20px !important;
    top: 20px !important;
    position: fixed !important;
  }
  .alert-icon {
    font-size: 1.5rem !important;
  }
  .alert-content {
    font-size: 0.875rem !important;
  }
  .swal2-popup {
    background-color: #1a202c !important; /* Dark background */
    color: #a0aec0 !important; /* Light text */
  }
  .swal2-title {
    color: #a0aec0 !important; /* Light text */
  }
  .swal2-content {
    color: #a0aec0 !important; /* Light text */
  }
`;

// Inserta los estilos en el documento
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
