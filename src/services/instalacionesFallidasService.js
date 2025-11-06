import { INSTALACIONES_FALLIDAS_ENDPOINTS } from "../config/api";

export async function buscarNeveraPorCodigo(code) {
  const url = INSTALACIONES_FALLIDAS_ENDPOINTS.SEARCH_NEVERA(code);
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error("Error al buscar la nevera");
  return await res.json();
}

export async function uploadImageBase64(base64Data, codNevera) {
  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

  const body = {
    file: cleanBase64,
    cod_nevera: codNevera,
  };
  console.log("📤 Subiendo imagen con body:", body);

  const res = await fetch(INSTALACIONES_FALLIDAS_ENDPOINTS.UPLOAD_IMAGE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error al subir imagen:", errorText);
    throw new Error("Error al subir imagen");
  }

  const data = await res.json();
  console.log("✅ Imagen subida con éxito:", data);
  return data;
}

export async function crearInstalacionFallida(data) {
  const res = await fetch(INSTALACIONES_FALLIDAS_ENDPOINTS.CREATE_FALLIDA, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  let responseData = null;
  try {
    responseData = await res.json();
  } catch {
    responseData = null;
  }

  if (!res.ok) {
    const backendMsg =
      responseData?.msg ||
      responseData?.message ||
      JSON.stringify(responseData) ||
      "Error desconocido al registrar instalación fallida";
    throw new Error(backendMsg);
  }

  return responseData;
}

export async function registrarGestionFallida(data) {
  const res = await fetch(INSTALACIONES_FALLIDAS_ENDPOINTS.UPDATE_GESTION, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  let responseData = null;
  try {
    responseData = await res.json();
  } catch {
    responseData = null;
  }

  if (!res.ok) {
    const backendMsg =
      responseData?.msg ||
      responseData?.message ||
      JSON.stringify(responseData) ||
      "Error desconocido al registrar gestión logística";
    throw new Error(backendMsg);
  }

  return responseData;
}


export const validarActaFallidaPorDia = async (codigoNevera, fecha) => {
  try {
    const url = `https://phuyu-iot.com/NESTLE-API-TECNICOS/api/v1/logistica/validarActasFallidasPorDia?nevera=${codigoNevera}&fecha=${fecha}`;
    const res = await fetch(url);

    if (res.status === 200) {
      const data = await res.json();
      return { status: 1, msg: data.msg };
    } else {
      const data = await res.json();
      return { status: 0, msg: data.msg };
    }
  } catch (error) {
    console.error("Error validando acta fallida:", error);
    return { status: 0, msg: "Error al validar la nevera" };
  }
};