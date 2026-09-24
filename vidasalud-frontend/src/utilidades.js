// Descarga una matriz de filas como archivo CSV (con BOM para Excel).
export function descargarCSV(filas, nombreArchivo) {
  const texto = filas.map((f) => f.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + texto], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}

// Compara ids sin importar que vengan como número o string.
export const mismoId = (a, b) => String(a) === String(b);

// Busca un elemento por id (tolerante a número/string).
export const encontrarPorId = (lista, id) => lista.find((x) => mismoId(x.id, id));