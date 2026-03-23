/**
 * Construye la URL completa de una imagen almacenada en uploads
 * @param {string} imagenData - Nombre del archivo de imagen (ej: "img_12345.jpg")
 * @returns {string} URL completa de la imagen
 */
export const getImageUrl = (imagenData) => {
    if (!imagenData) return '';
    const baseUrl = import.meta.env.VITE_BASE_URL.replace('/api/', '');
    // Asegurar que no haya doble barra
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    return `${cleanBaseUrl}uploads/${imagenData}`;
};
