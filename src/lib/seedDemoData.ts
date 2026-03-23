import { supabase } from "@/integrations/supabase/client";

export async function seedDemoData(shopId: string) {
  // Customers
  const customers = [
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "Roberto Méndez", phone: "+52 55 1234 5678", email: "roberto@email.com" },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "María Gutiérrez", phone: "+52 55 2345 6789", email: "maria@email.com" },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "Carlos Hernández", phone: "+52 55 3456 7890", email: null },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "Ana López", phone: "+52 55 4567 8901", email: "ana@email.com" },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "José Ramírez", phone: "+52 55 5678 9012", email: null },
  ];
  await supabase.from("customers").insert(customers);

  // Vehicles
  const vehicles = [
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[0].id, plate: "ABC-1234", make: "Nissan", model: "Tsuru", year: 2017, color: "Blanco" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[1].id, plate: "DEF-5678", make: "Chevrolet", model: "Aveo", year: 2019, color: "Rojo" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[2].id, plate: "GHI-9012", make: "Volkswagen", model: "Jetta", year: 2020, color: "Gris" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[3].id, plate: "JKL-3456", make: "Toyota", model: "Corolla", year: 2021, color: "Negro" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[4].id, plate: "MNO-7890", make: "Ford", model: "Focus", year: 2018, color: "Azul" },
  ];
  await supabase.from("vehicles").insert(vehicles);

  // Orders
  const orders = [
    {
      id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[0].id, vehicle_id: vehicles[0].id,
      public_code: "ORD-0001", status: "entregado",
      problem_description: "Cambio de frenos delanteros y revisión de suspensión",
      subtotal: 2090, labor_total: 1700, total: 3790, paid_total: 3790, balance_due: 0,
    },
    {
      id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[1].id, vehicle_id: vehicles[1].id,
      public_code: "ORD-0002", status: "en_reparacion",
      problem_description: "Afinación mayor y cambio de bujías",
      subtotal: 2170, labor_total: 1800, total: 3970, paid_total: 2000, balance_due: 1970,
    },
    {
      id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[2].id, vehicle_id: vehicles[2].id,
      public_code: "ORD-0003", status: "diagnostico",
      problem_description: "Diagnóstico de ruido en motor",
      subtotal: 0, labor_total: 600, total: 600, paid_total: 0, balance_due: 600,
    },
    {
      id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[3].id, vehicle_id: vehicles[3].id,
      public_code: "ORD-0004", status: "cotizado",
      problem_description: "Cambio de clutch completo",
      subtotal: 7700, labor_total: 3500, total: 11200, paid_total: 0, balance_due: 11200,
    },
    {
      id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[4].id, vehicle_id: vehicles[4].id,
      public_code: "ORD-0005", status: "listo",
      problem_description: "Reparación de sistema eléctrico y alternador",
      subtotal: 3150, labor_total: 2300, total: 5450, paid_total: 3000, balance_due: 2450,
    },
    {
      id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[0].id, vehicle_id: vehicles[0].id,
      public_code: "ORD-0006", status: "recibido",
      problem_description: "Revisión general y cambio de aceite",
      subtotal: 0, labor_total: 0, total: 0, paid_total: 0, balance_due: 0,
    },
  ];
  await supabase.from("orders").insert(orders);

  // Order items
  const items = [
    // ORD-0001
    { order_id: orders[0].id, type: "part", name: "Balatas delanteras cerámicas", quantity: 1, unit_price: 850, total_price: 850 },
    { order_id: orders[0].id, type: "part", name: "Discos de freno", quantity: 2, unit_price: 620, total_price: 1240 },
    { order_id: orders[0].id, type: "labor", name: "Cambio de frenos delanteros", quantity: 1, unit_price: 1200, total_price: 1200 },
    { order_id: orders[0].id, type: "labor", name: "Revisión de suspensión", quantity: 1, unit_price: 500, total_price: 500 },
    // ORD-0002
    { order_id: orders[1].id, type: "part", name: "Kit de afinación (filtros + bujías)", quantity: 1, unit_price: 1450, total_price: 1450 },
    { order_id: orders[1].id, type: "part", name: "Aceite sintético 5W-30", quantity: 4, unit_price: 180, total_price: 720 },
    { order_id: orders[1].id, type: "labor", name: "Afinación mayor completa", quantity: 1, unit_price: 1800, total_price: 1800 },
    // ORD-0003
    { order_id: orders[2].id, type: "labor", name: "Diagnóstico computarizado", quantity: 1, unit_price: 600, total_price: 600 },
    // ORD-0004
    { order_id: orders[3].id, type: "part", name: "Kit de clutch completo", quantity: 1, unit_price: 4500, total_price: 4500 },
    { order_id: orders[3].id, type: "part", name: "Volante de motor", quantity: 1, unit_price: 3200, total_price: 3200 },
    { order_id: orders[3].id, type: "labor", name: "Cambio de clutch", quantity: 1, unit_price: 3500, total_price: 3500 },
    // ORD-0005
    { order_id: orders[4].id, type: "part", name: "Alternador remanufacturado", quantity: 1, unit_price: 2800, total_price: 2800 },
    { order_id: orders[4].id, type: "part", name: "Banda del alternador", quantity: 1, unit_price: 350, total_price: 350 },
    { order_id: orders[4].id, type: "labor", name: "Cambio de alternador", quantity: 1, unit_price: 1500, total_price: 1500 },
    { order_id: orders[4].id, type: "labor", name: "Revisión eléctrica general", quantity: 1, unit_price: 800, total_price: 800 },
  ];
  await supabase.from("order_items").insert(items);

  // Order status events
  const events = [
    // ORD-0001 (entregado)
    { order_id: orders[0].id, status: "recibido", created_at: "2026-03-10T09:00:00Z" },
    { order_id: orders[0].id, status: "diagnostico", created_at: "2026-03-10T14:00:00Z" },
    { order_id: orders[0].id, status: "cotizado", created_at: "2026-03-11T10:00:00Z" },
    { order_id: orders[0].id, status: "aprobado", created_at: "2026-03-11T16:00:00Z" },
    { order_id: orders[0].id, status: "en_reparacion", created_at: "2026-03-12T08:00:00Z" },
    { order_id: orders[0].id, status: "listo", created_at: "2026-03-14T17:00:00Z" },
    { order_id: orders[0].id, status: "entregado", created_at: "2026-03-15T11:00:00Z" },
    // ORD-0002 (en_reparacion)
    { order_id: orders[1].id, status: "recibido", created_at: "2026-03-18T09:00:00Z" },
    { order_id: orders[1].id, status: "diagnostico", created_at: "2026-03-18T14:00:00Z" },
    { order_id: orders[1].id, status: "cotizado", created_at: "2026-03-19T10:00:00Z" },
    { order_id: orders[1].id, status: "aprobado", created_at: "2026-03-19T15:00:00Z" },
    { order_id: orders[1].id, status: "en_reparacion", created_at: "2026-03-20T08:00:00Z" },
    // ORD-0003 (diagnostico)
    { order_id: orders[2].id, status: "recibido", created_at: "2026-03-20T09:00:00Z" },
    { order_id: orders[2].id, status: "diagnostico", created_at: "2026-03-21T10:00:00Z" },
    // ORD-0004 (cotizado)
    { order_id: orders[3].id, status: "recibido", created_at: "2026-03-21T09:00:00Z" },
    { order_id: orders[3].id, status: "diagnostico", created_at: "2026-03-21T14:00:00Z" },
    { order_id: orders[3].id, status: "cotizado", created_at: "2026-03-22T10:00:00Z" },
    // ORD-0005 (listo)
    { order_id: orders[4].id, status: "recibido", created_at: "2026-03-15T09:00:00Z" },
    { order_id: orders[4].id, status: "diagnostico", created_at: "2026-03-15T14:00:00Z" },
    { order_id: orders[4].id, status: "cotizado", created_at: "2026-03-16T10:00:00Z" },
    { order_id: orders[4].id, status: "aprobado", created_at: "2026-03-16T15:00:00Z" },
    { order_id: orders[4].id, status: "en_reparacion", created_at: "2026-03-17T08:00:00Z" },
    { order_id: orders[4].id, status: "listo", created_at: "2026-03-22T16:00:00Z" },
    // ORD-0006 (recibido)
    { order_id: orders[5].id, status: "recibido", created_at: "2026-03-23T09:00:00Z" },
  ];
  await supabase.from("order_status_events").insert(events);

  // Fiados
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(pastDate.getDate() - 10);
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + 20);
  const soonDate = new Date(today);
  soonDate.setDate(soonDate.getDate() + 3);

  const fiados = [
    {
      id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[1].id, order_id: orders[1].id,
      total_amount: 1970, paid_amount: 0, balance_due: 1970,
      due_date: futureDate.toISOString().split("T")[0], status: "pendiente",
    },
    {
      id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[4].id, order_id: orders[4].id,
      total_amount: 2450, paid_amount: 1000, balance_due: 1450,
      due_date: soonDate.toISOString().split("T")[0], status: "por_vencer",
    },
    {
      id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[2].id, order_id: orders[2].id,
      total_amount: 600, paid_amount: 0, balance_due: 600,
      due_date: pastDate.toISOString().split("T")[0], status: "vencido",
    },
  ];
  await supabase.from("fiados").insert(fiados);

  // Fiado payments
  await supabase.from("fiado_payments").insert([
    { fiado_id: fiados[1].id, amount: 1000, payment_date: new Date(today.getTime() - 5 * 86400000).toISOString().split("T")[0], method: "efectivo", note: "Abono parcial" },
  ]);

  // Products
  const products = [
    { shop_id: shopId, name: "Aceite sintético 5W-30", sku: "ACE-001", category: "Lubricantes", unit: "litro", cost: 120, price: 180, stock_qty: 12, min_qty: 5 },
    { shop_id: shopId, name: "Filtro de aceite universal", sku: "FIL-001", category: "Filtros", unit: "pieza", cost: 45, price: 85, stock_qty: 8, min_qty: 3 },
    { shop_id: shopId, name: "Balatas delanteras cerámicas", sku: "BAL-001", category: "Frenos", unit: "juego", cost: 450, price: 850, stock_qty: 2, min_qty: 3 },
    { shop_id: shopId, name: "Bujías de iridio", sku: "BUJ-001", category: "Encendido", unit: "pieza", cost: 95, price: 180, stock_qty: 16, min_qty: 8 },
    { shop_id: shopId, name: "Banda serpentina", sku: "BAN-001", category: "Bandas", unit: "pieza", cost: 180, price: 350, stock_qty: 1, min_qty: 2 },
    { shop_id: shopId, name: "Líquido de frenos DOT 4", sku: "LIQ-001", category: "Lubricantes", unit: "litro", cost: 65, price: 120, stock_qty: 6, min_qty: 3 },
    { shop_id: shopId, name: "Anticongelante verde", sku: "ANT-001", category: "Lubricantes", unit: "litro", cost: 55, price: 95, stock_qty: 4, min_qty: 4 },
    { shop_id: shopId, name: "Disco de freno ventilado", sku: "DIS-001", category: "Frenos", unit: "pieza", cost: 350, price: 620, stock_qty: 0, min_qty: 2 },
  ];
  await supabase.from("products").insert(products);

  // Reminders
  const reminderDate1 = new Date(today);
  reminderDate1.setDate(reminderDate1.getDate() + 2);
  const reminderDate2 = new Date(today);
  reminderDate2.setDate(reminderDate2.getDate() + 7);
  await supabase.from("reminders").insert([
    { shop_id: shopId, customer_id: customers[0].id, vehicle_id: vehicles[0].id, type: "service", title: "Cambio de aceite programado", due_at: reminderDate1.toISOString(), status: "pending" },
    { shop_id: shopId, customer_id: customers[3].id, vehicle_id: vehicles[3].id, type: "followup", title: "Seguimiento cotización clutch", due_at: reminderDate2.toISOString(), status: "pending" },
    { shop_id: shopId, customer_id: customers[2].id, type: "payment", title: "Cobro de fío vencido", due_at: today.toISOString(), status: "pending" },
  ]);
}
