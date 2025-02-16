
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


  export const validateAddress = (value) => {
    let error = "";
  
    // Validar si el campo está vacío
    if (!value.trim()) {
      error = "La dirección es requerida";
    }
    // Validar longitud mínima de 10 caracteres
    else if (value.length < 10) {
      error = "La dirección debe tener al menos 10 caracteres";
    }
    // Validar longitud máxima de 100 caracteres
    else if (value.length > 100) {
      error = "La dirección no puede tener más de 100 caracteres";
    }
  
    return error;
  };
  

  export const validateFechaNacimiento = (value) => {
    let error = "";
  
    
    if (!value.trim()) {
      error = "La fecha de nacimiento es requerida";
    }
    
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      error = "El formato de la fecha debe ser YYYY-MM-DD";
    }
       else {
      const fechaNacimiento = new Date(value);
      const hoy = new Date();
  
    
      if (fechaNacimiento > hoy) {
        error = "La fecha de nacimiento no puede ser futura";
      }
    
      else {
        const añoMinimo = hoy.getFullYear() - 200; // Límite de 200 años en el pasado
        if (fechaNacimiento.getFullYear() < añoMinimo) {
          error = "La fecha de nacimiento no puede ser menor a hace 200 años";
        }
    
        else {
          const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
          if (edad < 10) {
            error = "Debes tener al menos 10 años";
          }
        }
      }
    }
  
    return error;
  };