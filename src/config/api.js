export const BASE_URL_TECNICOS = "https://phuyu-iot.com/NESTLE-API-TECNICOS/api/v1";
export const BASE_URL_CONSULTAS = "https://phuyu-iot.com/NESTLE-VCA/api/Consultas";
export const BASE_URL_LOGISTICA = "https://phuyu-iot.com/NESTLE-API-TECNICOS/api/v1/logistica";

export const AUTH_ENDPOINTS = {
  AUTHENTICATE: `${BASE_URL_TECNICOS}/auth/authenticate`,
  REFRESH_TOKEN: `${BASE_URL_TECNICOS}/auth/refresh-token`,
};

export const USER_ENDPOINTS = {
  GET_USUARIO: (idUsuario) => `${BASE_URL_TECNICOS}/usuarios/${idUsuario}`,
  UPDATE_USUARIO: (idUsuario) => `${BASE_URL_TECNICOS}/usuarios/${idUsuario}`,
  UPLOAD_FIRMA: (idUsuario) => `${BASE_URL_TECNICOS}/usuarios/${idUsuario}/firma`,
};

export const INSTALACIONES_ENDPOINTS = {
  LISTAR: `${BASE_URL_TECNICOS}/instalaciones`,
  CREAR: `${BASE_URL_TECNICOS}/instalaciones`,
  DETALLE: (id) => `${BASE_URL_TECNICOS}/instalaciones/${id}`,
  ACTUALIZAR: (id) => `${BASE_URL_TECNICOS}/instalaciones/${id}`,
};

export const HISTORIAL_ENDPOINTS = {
  INSTALACIONES_EFECTIVAS: (idUsuario) =>
    `${BASE_URL_TECNICOS}/instalaciones/usuario/${idUsuario}`,
  INSTALACIONES_FALLIDAS: (idUsuario) =>
    `${BASE_URL_TECNICOS}/instalaciones-fallidas/usuario/${idUsuario}`,
};

export const INSTALACIONES_FALLIDAS_ENDPOINTS = {
  SEARCH_NEVERA: (code) =>
    `${BASE_URL_CONSULTAS}/search/cod-nevera/${code}/$2a$10$c9JOB_7GMt.QtBgvKMPB4c.I8KgUy8TioiwJJydKJMBXXPhFwODtpqx2-z3/`,
  UPLOAD_IMAGE: `${BASE_URL_TECNICOS}/instalaciones/uploadImageInstalacionNeveraBase64`,
  CREATE_FALLIDA: `${BASE_URL_TECNICOS}/instalaciones-fallidas`,
  UPDATE_GESTION: `${BASE_URL_LOGISTICA}/appTecnicoUpdateOrRegisterGestion2`,
};
