export function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export const STATUS_LABELS: Record<string, string> = {
  recibido: "Recibido",
  diagnostico: "Diagnóstico",
  cotizado: "Cotizado",
  aprobado: "Aprobado",
  en_reparacion: "En reparación",
  listo: "Listo",
  entregado: "Entregado",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
};

export const STATUS_ORDER = [
  "recibido",
  "diagnostico",
  "cotizado",
  "aprobado",
  "en_reparacion",
  "listo",
  "entregado",
] as const;
