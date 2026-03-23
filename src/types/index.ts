export type OrdenEstado =
  | "Recibido"
  | "Diagnóstico"
  | "Cotizado"
  | "Aprobado"
  | "En reparación"
  | "Listo"
  | "Entregado";

export const ORDEN_ESTADOS: OrdenEstado[] = [
  "Recibido",
  "Diagnóstico",
  "Cotizado",
  "Aprobado",
  "En reparación",
  "Listo",
  "Entregado",
];

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
}

export interface Vehiculo {
  id: string;
  clienteId: string;
  marca: string;
  modelo: string;
  anio: number;
  placa: string;
  color: string;
}

export interface Refaccion {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

export interface ManoDeObra {
  descripcion: string;
  costo: number;
}

export interface OrdenNota {
  fecha: string;
  texto: string;
}

export interface OrdenTimeline {
  estado: OrdenEstado;
  fecha: string;
}

export interface Orden {
  id: string;
  codigo: string;
  clienteId: string;
  vehiculoId: string;
  descripcion: string;
  estado: OrdenEstado;
  fechaIngreso: string;
  timeline: OrdenTimeline[];
  refacciones: Refaccion[];
  manoDeObra: ManoDeObra[];
  notas: OrdenNota[];
  totalRefacciones: number;
  totalManoDeObra: number;
  total: number;
  abonado: number;
  saldoPendiente: number;
}

export interface Fio {
  id: string;
  clienteId: string;
  ordenId: string;
  montoOriginal: number;
  abonado: number;
  saldoPendiente: number;
  fechaCreacion: string;
  fechaVencimiento: string;
  estado: "vigente" | "vencido" | "pagado";
  abonos: Abono[];
}

export interface Abono {
  id: string;
  fecha: string;
  monto: number;
  metodo: "efectivo" | "transferencia" | "tarjeta";
}
