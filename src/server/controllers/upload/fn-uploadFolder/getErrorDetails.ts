
function getErrorDetails(code: string): string {
    const details: Record<string, string> = {
        'CONNECTION_INTERRUPTED': 'La conexión se perdió. Verifica tu conexión a internet e intenta con archivos más pequeños.',
        'UPLOAD_TIMEOUT': 'La subida tardó demasiado. Reduce el tamaño o número de archivos.',
        'FILE_TOO_LARGE': 'Uno o más archivos son demasiado grandes.',
        'TOTAL_SIZE_EXCEEDED': 'El tamaño total de todos los archivos excede el límite.',
        'TOO_MANY_FILES': 'Demasiados archivos en la carpeta.',
        'INVALID_EXTENSION': 'Algunos archivos tienen extensiones no permitidas.',
        'NO_WRITE_PERMISSIONS': 'El servidor no tiene permisos para guardar archivos.',
        'INVALID_CONTENT_TYPE': 'El formato de la petición no es correcto.',
        'NO_VALID_FILES': 'No se encontraron archivos válidos para subir.',
        'NO_AUTH_TOKEN': 'Token de autorización requerido en header Authorization.',
        'INVALID_TOKEN': 'Token JWT inválido o expirado.',
        'USER_NOT_FOUND': 'Usuario no encontrado en la base de datos.',
        'DATABASE_SAVE_ERROR': 'Error guardando archivos en la base de datos.',
        'INTERNAL_ERROR': 'Error inesperado en el servidor.'
    };

    return details[code] || 'Error desconocido durante la subida.';
}

export default getErrorDetails;