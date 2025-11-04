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
  if (!res.ok) throw new Error("Error al registrar instalación fallida");
  return await res.json();
}

export async function registrarGestionFallida(data) {
  const res = await fetch(INSTALACIONES_FALLIDAS_ENDPOINTS.UPDATE_GESTION, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al registrar gestión logística");
  return await res.json();
}
