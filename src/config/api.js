export const BASE_URL = "https://phuyu-iot.com/NESTLE-API-TECNICOS/api/v1";

// Endpoints de autenticación
export const AUTH_ENDPOINTS = {
    AUTHENTICATE: `${BASE_URL}/auth/authenticate`,
    REFRESH_TOKEN: `${BASE_URL}/auth/refresh-token`,
};

// Endpoints de usuarios
export const USER_ENDPOINTS = {
    GET_USUARIO: (idUsuario) => `${BASE_URL}/usuarios/${idUsuario}`,
    UPDATE_USUARIO: (idUsuario) => `${BASE_URL}/usuarios/${idUsuario}`,
    UPLOAD_FIRMA: (idUsuario) => `${BASE_URL}/usuarios/${idUsuario}/firma`,
};

// Endpoints de instalaciones
export const INSTALACIONES_ENDPOINTS = {
    LISTAR: `${BASE_URL}/instalaciones`,
    CREAR: `${BASE_URL}/instalaciones`,
    DETALLE: (id) => `${BASE_URL}/instalaciones/${id}`,
    ACTUALIZAR: (id) => `${BASE_URL}/instalaciones/${id}`,
};


// PANTALLA PERFIL
