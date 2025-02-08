
export const validateName = (value, fieldName) => {
    let error = "";
  
    // Validar si el campo está vacío
    if (!value.trim()) {
      error = `El ${fieldName} es requerido`;
    } 
    // Validar que solo contenga letras y espacios (incluyendo acentos y caracteres especiales como 'ü')
    else if (!/^[a-zA-Z\u00C0-\u00FF\s]+$/.test(value)) {
      error = `Por favor, use solo letras (incluidos acentos y ü) y espacios en el ${fieldName}`;
    } 
    // Validar longitud mínima de 3 caracteres
    else if (value.length < 3) {
      error = `El ${fieldName} debe tener al menos 3 caracteres`;
    } 
    // Validar longitud máxima de 30 caracteres
    else if (value.length > 30) {
      error = `El ${fieldName} no puede tener más de 30 caracteres`;
    } 
    // Validar si hay una misma letra repetida más de dos veces consecutivamente
    else if (/([a-zA-Z\u00C0-\u00FF])\1{2,}/.test(value)) {
      error = `El ${fieldName} no puede contener la misma letra más de dos veces consecutivas`;
    }
  
    return error;
  };

  export const validatePhone = (value) => {
    const phonePattern = /^\d{10}$/;
    let error = "";
  
    if (!phonePattern.test(value)) {
      error = "El número de teléfono debe tener 10 dígitos y solo contener números";
    }
  
    return error;
  };
  