const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s][A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s]*$/;
const REGEX_MATERIAL = /^[A-Za-z0-9ÁÉÍÓÚáéíóúñÑ\s\-/]+$/;

export function validateProduct(product, totalImagesCount) {
  const errors = {};

  // Validación del nombre del producto
  if (!product.nombre || product.nombre.trim().length < 3) {
    errors.nombre = "El nombre debe tener al menos 3 caracteres.";
  } else if (product.nombre.trim().length > 50) {
    errors.nombre = "El nombre no puede exceder los 50 caracteres.";
  } else if (!REGEX_NOMBRE.test(product.nombre.trim())) {
    errors.nombre =
      "El nombre solo puede contener letras, espacios y acentos básicos.";
  } else {
    const distinctChars = new Set(product.nombre.toLowerCase().replace(/\s/g, ''));
    if (distinctChars.size < 3) {
      errors.nombre = "El nombre no parece válido. Ingrese un valor descriptivo.";
    }
  }

  // Validar que se suba al menos una imagen (usando totalImagesCount)
  if (!totalImagesCount || totalImagesCount === 0) {
    errors.ImagenesProducto = "Debes subir al menos una imagen.";
  }

  // Validación de detalles
  const detallesLength = product.detalles ? product.detalles.trim().length : 0;
  if (detallesLength < 6) {
    errors.detalles = "Los detalles deben tener al menos 6 caracteres.";
  } else if (detallesLength > 500) {
    errors.detalles = "Los detalles no pueden exceder 500 caracteres.";
  }

  // Validar subcategoría
  if (!product.idSubcategoria) {
    errors.idSubcategoria = "Selecciona una subcategoría.";
  }

  // Validar color
  if (!product.color || product.color.trim() === "") {
    errors.color = "Debes ingresar al menos un color.";
  } else {
    const colores = product.color.split(",");
    for (let i = 0; i < colores.length; i++) {
      const c = colores[i].trim();
      if (c.length < 3) {
        errors.color = "Cada color debe tener al menos 3 caracteres. Ej: 'Rojo, Azul, Verde'";
        break;
      }
      if (!REGEX_NOMBRE.test(c)) {
        errors.color = "Solo se permiten letras y espacios en cada color (mín. 3 caracteres).";
        break;
      }
      if (new Set(c.toLowerCase()).size < 3) {
        errors.color = "El color ingresado no parece válido. Por favor, ingresa un color descriptivo.";
        break;
      }
    }
  }

  // Validar material
  if (!product.material || product.material.trim() === "") {
    errors.material = "El material es requerido.";
  } else if (product.material.trim().length < 3) {
    errors.material = "El material debe tener al menos 3 caracteres.";
  } else if (product.material.trim().length > 50) {
    errors.material = "El material no puede exceder 50 caracteres.";
  } else if (!REGEX_MATERIAL.test(product.material.trim())) {
    errors.material = "El material contiene caracteres no permitidos. Ej: letras, números, espacios, guiones...";
  } else {
    const distinctMat = new Set(product.material.toLowerCase().replace(/\s/g, ''));
    if (distinctMat.size < 3) {
      errors.material = "El material no parece válido. Ingrese un valor descriptivo.";
    }
  }

  return errors;
}
