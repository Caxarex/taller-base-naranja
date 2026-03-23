import type { Cliente, Vehiculo, Orden, Fio } from "@/types";

export const clientes: Cliente[] = [
  { id: "c1", nombre: "Roberto Méndez", telefono: "+52 55 1234 5678" },
  { id: "c2", nombre: "María Gutiérrez", telefono: "+52 55 2345 6789" },
  { id: "c3", nombre: "Carlos Hernández", telefono: "+52 55 3456 7890" },
  { id: "c4", nombre: "Ana López", telefono: "+52 55 4567 8901" },
  { id: "c5", nombre: "José Ramírez", telefono: "+52 55 5678 9012" },
];

export const vehiculos: Vehiculo[] = [
  { id: "v1", clienteId: "c1", marca: "Nissan", modelo: "Tsuru", anio: 2017, placa: "ABC-1234", color: "Blanco" },
  { id: "v2", clienteId: "c2", marca: "Chevrolet", modelo: "Aveo", anio: 2019, placa: "DEF-5678", color: "Rojo" },
  { id: "v3", clienteId: "c3", marca: "Volkswagen", modelo: "Jetta", anio: 2020, placa: "GHI-9012", color: "Gris" },
  { id: "v4", clienteId: "c4", marca: "Toyota", modelo: "Corolla", anio: 2021, placa: "JKL-3456", color: "Negro" },
  { id: "v5", clienteId: "c5", marca: "Ford", modelo: "Focus", anio: 2018, placa: "MNO-7890", color: "Azul" },
];

export const ordenes: Orden[] = [
  {
    id: "o1", codigo: "ORD-0001", clienteId: "c1", vehiculoId: "v1",
    descripcion: "Cambio de frenos delanteros y revisión de suspensión",
    estado: "Entregado",
    fechaIngreso: "2025-03-10",
    timeline: [
      { estado: "Recibido", fecha: "2025-03-10" },
      { estado: "Diagnóstico", fecha: "2025-03-10" },
      { estado: "Cotizado", fecha: "2025-03-11" },
      { estado: "Aprobado", fecha: "2025-03-11" },
      { estado: "En reparación", fecha: "2025-03-12" },
      { estado: "Listo", fecha: "2025-03-14" },
      { estado: "Entregado", fecha: "2025-03-15" },
    ],
    refacciones: [
      { descripcion: "Balatas delanteras cerámicas", cantidad: 1, precioUnitario: 850 },
      { descripcion: "Discos de freno", cantidad: 2, precioUnitario: 620 },
    ],
    manoDeObra: [
      { descripcion: "Cambio de frenos delanteros", costo: 1200 },
      { descripcion: "Revisión de suspensión", costo: 500 },
    ],
    notas: [{ fecha: "2025-03-10", texto: "Cliente solicita revisión urgente." }],
    totalRefacciones: 2090, totalManoDeObra: 1700, total: 3790, abonado: 3790, saldoPendiente: 0,
  },
  {
    id: "o2", codigo: "ORD-0002", clienteId: "c2", vehiculoId: "v2",
    descripcion: "Afinación mayor y cambio de bujías",
    estado: "En reparación",
    fechaIngreso: "2025-03-18",
    timeline: [
      { estado: "Recibido", fecha: "2025-03-18" },
      { estado: "Diagnóstico", fecha: "2025-03-18" },
      { estado: "Cotizado", fecha: "2025-03-19" },
      { estado: "Aprobado", fecha: "2025-03-19" },
      { estado: "En reparación", fecha: "2025-03-20" },
    ],
    refacciones: [
      { descripcion: "Kit de afinación (filtros + bujías)", cantidad: 1, precioUnitario: 1450 },
      { descripcion: "Aceite sintético 5W-30", cantidad: 4, precioUnitario: 180 },
    ],
    manoDeObra: [
      { descripcion: "Afinación mayor completa", costo: 1800 },
    ],
    notas: [{ fecha: "2025-03-18", texto: "Vehículo presenta falla en ralentí." }],
    totalRefacciones: 2170, totalManoDeObra: 1800, total: 3970, abonado: 2000, saldoPendiente: 1970,
  },
  {
    id: "o3", codigo: "ORD-0003", clienteId: "c3", vehiculoId: "v3",
    descripcion: "Diagnóstico de ruido en motor",
    estado: "Diagnóstico",
    fechaIngreso: "2025-03-20",
    timeline: [
      { estado: "Recibido", fecha: "2025-03-20" },
      { estado: "Diagnóstico", fecha: "2025-03-21" },
    ],
    refacciones: [],
    manoDeObra: [{ descripcion: "Diagnóstico computarizado", costo: 600 }],
    notas: [{ fecha: "2025-03-21", texto: "Posible falla en cadena de distribución." }],
    totalRefacciones: 0, totalManoDeObra: 600, total: 600, abonado: 0, saldoPendiente: 600,
  },
  {
    id: "o4", codigo: "ORD-0004", clienteId: "c4", vehiculoId: "v4",
    descripcion: "Cambio de clutch completo",
    estado: "Cotizado",
    fechaIngreso: "2025-03-21",
    timeline: [
      { estado: "Recibido", fecha: "2025-03-21" },
      { estado: "Diagnóstico", fecha: "2025-03-21" },
      { estado: "Cotizado", fecha: "2025-03-22" },
    ],
    refacciones: [
      { descripcion: "Kit de clutch completo", cantidad: 1, precioUnitario: 4500 },
      { descripcion: "Volante de motor", cantidad: 1, precioUnitario: 3200 },
    ],
    manoDeObra: [{ descripcion: "Cambio de clutch", costo: 3500 }],
    notas: [],
    totalRefacciones: 7700, totalManoDeObra: 3500, total: 11200, abonado: 0, saldoPendiente: 11200,
  },
  {
    id: "o5", codigo: "ORD-0005", clienteId: "c5", vehiculoId: "v5",
    descripcion: "Reparación de sistema eléctrico y alternador",
    estado: "Listo",
    fechaIngreso: "2025-03-15",
    timeline: [
      { estado: "Recibido", fecha: "2025-03-15" },
      { estado: "Diagnóstico", fecha: "2025-03-15" },
      { estado: "Cotizado", fecha: "2025-03-16" },
      { estado: "Aprobado", fecha: "2025-03-16" },
      { estado: "En reparación", fecha: "2025-03-17" },
      { estado: "Listo", fecha: "2025-03-22" },
    ],
    refacciones: [
      { descripcion: "Alternador remanufacturado", cantidad: 1, precioUnitario: 2800 },
      { descripcion: "Banda del alternador", cantidad: 1, precioUnitario: 350 },
    ],
    manoDeObra: [
      { descripcion: "Cambio de alternador", costo: 1500 },
      { descripcion: "Revisión eléctrica general", costo: 800 },
    ],
    notas: [{ fecha: "2025-03-17", texto: "Se encontró cableado dañado adicional." }],
    totalRefacciones: 3150, totalManoDeObra: 2300, total: 5450, abonado: 3000, saldoPendiente: 2450,
  },
];

export const fios: Fio[] = [
  {
    id: "f1", clienteId: "c2", ordenId: "o2",
    montoOriginal: 1970, abonado: 0, saldoPendiente: 1970,
    fechaCreacion: "2025-03-20", fechaVencimiento: "2025-04-20",
    estado: "vigente",
    abonos: [],
  },
  {
    id: "f2", clienteId: "c5", ordenId: "o5",
    montoOriginal: 2450, abonado: 1000, saldoPendiente: 1450,
    fechaCreacion: "2025-03-15", fechaVencimiento: "2025-04-15",
    estado: "vigente",
    abonos: [
      { id: "a1", fecha: "2025-03-20", monto: 1000, metodo: "efectivo" },
    ],
  },
  {
    id: "f3", clienteId: "c3", ordenId: "o3",
    montoOriginal: 600, abonado: 0, saldoPendiente: 600,
    fechaCreacion: "2025-02-15", fechaVencimiento: "2025-03-15",
    estado: "vencido",
    abonos: [],
  },
];

// Helpers
export function getCliente(id: string) {
  return clientes.find((c) => c.id === id);
}
export function getVehiculo(id: string) {
  return vehiculos.find((v) => v.id === id);
}
export function getOrden(id: string) {
  return ordenes.find((o) => o.id === id);
}
export function getOrdenByCodigo(codigo: string) {
  return ordenes.find((o) => o.codigo.toLowerCase() === codigo.toLowerCase());
}
export function getFio(id: string) {
  return fios.find((f) => f.id === id);
}
export function getFiosByCliente(clienteId: string) {
  return fios.filter((f) => f.clienteId === clienteId);
}
export function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}
