import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const EMAIL = "cazzzaresss@gmail.com";
  const PASSWORD = "TallioDemo123!";

  // Check if user already exists
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u: any) => u.email === EMAIL);

  let userId: string;

  if (existing) {
    userId = existing.id;
  } else {
    const { data: newUser, error: authErr } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Demo Owner" },
    });
    if (authErr || !newUser?.user) {
      return new Response(JSON.stringify({ error: authErr?.message || "Failed to create user" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    userId = newUser.user.id;
  }

  // Check if user already has a shop
  const { data: existingMembership } = await admin.from("shop_members").select("shop_id").eq("user_id", userId).eq("status", "active").maybeSingle();
  if (existingMembership) {
    return new Response(JSON.stringify({ success: true, message: "Demo user already has a shop", userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Create shop
  const { data: shop, error: shopErr } = await admin.from("shops").insert({
    name: "Taller Méndez Automotriz",
    slug: `taller-mendez-${Date.now().toString(36)}`,
    phone: "+52 55 1234 5678",
    email: "contacto@tallermendez.mx",
    address: "Av. Insurgentes Sur 1234, Col. Del Valle",
    city: "Ciudad de México",
    state: "CDMX",
    country: "MX",
    created_by: userId,
  }).select("id").single();

  if (shopErr || !shop) {
    return new Response(JSON.stringify({ error: shopErr?.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const shopId = shop.id;

  // Create shop members
  await admin.from("shop_members").insert({ shop_id: shopId, user_id: userId, role: "owner", status: "active" });

  // Create rich demo data
  const customers = [
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "Roberto Méndez García", phone: "+52 55 1234 5678", email: "roberto.mendez@email.com", address: "Col. Roma Norte #45" },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "María Gutiérrez López", phone: "+52 55 2345 6789", email: "maria.gtz@email.com", address: "Col. Condesa #78" },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "Carlos Hernández Ruiz", phone: "+52 55 3456 7890", email: null, address: "Col. Nápoles #12" },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "Ana López Martínez", phone: "+52 55 4567 8901", email: "ana.lopez@email.com", address: null },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "José Ramírez Torres", phone: "+52 55 5678 9012", email: null, address: "Col. Del Valle #89" },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "Lupita Fernández", phone: "+52 55 6789 0123", email: "lupita@email.com", address: "Col. Coyoacán #34" },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "Pedro Sánchez Mora", phone: "+52 55 7890 1234", email: null, address: null },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "Sofía Castillo Vega", phone: "+52 55 8901 2345", email: "sofia.castillo@email.com", address: "Col. Polanco #56" },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "Miguel Ángel Reyes", phone: "+52 55 9012 3456", email: null, address: "Col. Mixcoac #23" },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "Laura Domínguez", phone: "+52 55 0123 4567", email: "laura.dom@email.com", address: null },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "Fernando Ortiz Paz", phone: "+52 55 1111 2222", email: null, address: "Col. San Ángel #67" },
    { id: crypto.randomUUID(), shop_id: shopId, full_name: "Gabriela Moreno", phone: "+52 55 3333 4444", email: "gaby.moreno@email.com", address: "Col. Tlalpan #90" },
  ];
  await admin.from("customers").insert(customers);

  const vehicles = [
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[0].id, plate: "ABC-1234", make: "Nissan", model: "Tsuru", year: 2017, color: "Blanco" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[0].id, plate: "XYZ-9999", make: "Nissan", model: "Versa", year: 2022, color: "Gris" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[1].id, plate: "DEF-5678", make: "Chevrolet", model: "Aveo", year: 2019, color: "Rojo" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[2].id, plate: "GHI-9012", make: "Volkswagen", model: "Jetta", year: 2020, color: "Gris" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[3].id, plate: "JKL-3456", make: "Toyota", model: "Corolla", year: 2021, color: "Negro" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[4].id, plate: "MNO-7890", make: "Ford", model: "Focus", year: 2018, color: "Azul" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[5].id, plate: "PQR-1122", make: "Honda", model: "Civic", year: 2020, color: "Blanco" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[6].id, plate: "STU-3344", make: "Mazda", model: "3", year: 2019, color: "Rojo" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[7].id, plate: "VWX-5566", make: "BMW", model: "Serie 3", year: 2021, color: "Negro" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[8].id, plate: "YZA-7788", make: "Hyundai", model: "Tucson", year: 2022, color: "Plata" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[9].id, plate: "BCD-9900", make: "Kia", model: "Sportage", year: 2020, color: "Blanco" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[10].id, plate: "EFG-1133", make: "Volkswagen", model: "Tiguan", year: 2023, color: "Gris" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[11].id, plate: "HIJ-2244", make: "Toyota", model: "RAV4", year: 2021, color: "Azul" },
  ];
  await admin.from("vehicles").insert(vehicles);

  // 18 orders with varied statuses and dates
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

  const orders = [
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[0].id, vehicle_id: vehicles[0].id, public_code: "ORD-0001", status: "entregado", problem_description: "Cambio de frenos delanteros y revisión de suspensión", subtotal: 2090, labor_total: 1700, total: 3790, paid_total: 3790, balance_due: 0, created_at: daysAgo(45) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[1].id, vehicle_id: vehicles[2].id, public_code: "ORD-0002", status: "en_reparacion", problem_description: "Afinación mayor y cambio de bujías", subtotal: 2170, labor_total: 1800, total: 3970, paid_total: 2000, balance_due: 1970, created_at: daysAgo(5) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[2].id, vehicle_id: vehicles[3].id, public_code: "ORD-0003", status: "diagnostico", problem_description: "Diagnóstico de ruido en motor al acelerar", subtotal: 0, labor_total: 600, total: 600, paid_total: 0, balance_due: 600, created_at: daysAgo(2) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[3].id, vehicle_id: vehicles[4].id, public_code: "ORD-0004", status: "cotizado", problem_description: "Cambio de clutch completo", subtotal: 7700, labor_total: 3500, total: 11200, paid_total: 0, balance_due: 11200, created_at: daysAgo(3) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[4].id, vehicle_id: vehicles[5].id, public_code: "ORD-0005", status: "listo", problem_description: "Reparación de sistema eléctrico y alternador", subtotal: 3150, labor_total: 2300, total: 5450, paid_total: 3000, balance_due: 2450, created_at: daysAgo(8) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[0].id, vehicle_id: vehicles[1].id, public_code: "ORD-0006", status: "recibido", problem_description: "Revisión general y cambio de aceite", created_at: daysAgo(0) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[5].id, vehicle_id: vehicles[6].id, public_code: "ORD-0007", status: "entregado", problem_description: "Cambio de amortiguadores traseros", subtotal: 3200, labor_total: 1800, total: 5000, paid_total: 5000, balance_due: 0, created_at: daysAgo(30) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[6].id, vehicle_id: vehicles[7].id, public_code: "ORD-0008", status: "entregado", problem_description: "Alineación y balanceo", subtotal: 400, labor_total: 600, total: 1000, paid_total: 1000, balance_due: 0, created_at: daysAgo(25) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[7].id, vehicle_id: vehicles[8].id, public_code: "ORD-0009", status: "aprobado", problem_description: "Cambio de radiador y mangueras", subtotal: 4500, labor_total: 2200, total: 6700, paid_total: 0, balance_due: 6700, created_at: daysAgo(4) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[8].id, vehicle_id: vehicles[9].id, public_code: "ORD-0010", status: "en_reparacion", problem_description: "Cambio de bomba de agua y termostato", subtotal: 2800, labor_total: 1500, total: 4300, paid_total: 2000, balance_due: 2300, created_at: daysAgo(6) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[9].id, vehicle_id: vehicles[10].id, public_code: "ORD-0011", status: "entregado", problem_description: "Diagnóstico computarizado y cambio de sensor O2", subtotal: 1800, labor_total: 900, total: 2700, paid_total: 2700, balance_due: 0, created_at: daysAgo(20) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[10].id, vehicle_id: vehicles[11].id, public_code: "ORD-0012", status: "entregado", problem_description: "Servicio mayor 60,000 km", subtotal: 3500, labor_total: 2500, total: 6000, paid_total: 6000, balance_due: 0, created_at: daysAgo(15) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[11].id, vehicle_id: vehicles[12].id, public_code: "ORD-0013", status: "recibido", problem_description: "Ruido al girar el volante", created_at: daysAgo(1) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[2].id, vehicle_id: vehicles[3].id, public_code: "ORD-0014", status: "entregado", problem_description: "Cambio de batería y revisión eléctrica", subtotal: 2200, labor_total: 500, total: 2700, paid_total: 2700, balance_due: 0, created_at: daysAgo(35) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[5].id, vehicle_id: vehicles[6].id, public_code: "ORD-0015", status: "listo", problem_description: "Cambio de kit de distribución", subtotal: 5500, labor_total: 3000, total: 8500, paid_total: 4000, balance_due: 4500, created_at: daysAgo(7) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[1].id, vehicle_id: vehicles[2].id, public_code: "ORD-0016", status: "entregado", problem_description: "Pintura de golpe lateral", subtotal: 1500, labor_total: 4000, total: 5500, paid_total: 5500, balance_due: 0, created_at: daysAgo(40) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[8].id, vehicle_id: vehicles[9].id, public_code: "ORD-0017", status: "entregado", problem_description: "Cambio de aceite y filtros", subtotal: 800, labor_total: 400, total: 1200, paid_total: 1200, balance_due: 0, created_at: daysAgo(50) },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[3].id, vehicle_id: vehicles[4].id, public_code: "ORD-0018", status: "diagnostico", problem_description: "Fuga de aceite por retenes", subtotal: 0, labor_total: 800, total: 800, paid_total: 0, balance_due: 800, created_at: daysAgo(1) },
  ];
  await admin.from("orders").insert(orders);

  // Order items for orders with totals
  const items = [
    // ORD-0001
    { order_id: orders[0].id, type: "part", name: "Balatas delanteras cerámicas", quantity: 1, unit_price: 850, total_price: 850 },
    { order_id: orders[0].id, type: "part", name: "Discos de freno ventilados", quantity: 2, unit_price: 620, total_price: 1240 },
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
    // ORD-0007
    { order_id: orders[6].id, type: "part", name: "Amortiguadores traseros Monroe", quantity: 2, unit_price: 1600, total_price: 3200 },
    { order_id: orders[6].id, type: "labor", name: "Cambio de amortiguadores", quantity: 1, unit_price: 1800, total_price: 1800 },
    // ORD-0008
    { order_id: orders[7].id, type: "part", name: "Pesos de balanceo", quantity: 4, unit_price: 100, total_price: 400 },
    { order_id: orders[7].id, type: "labor", name: "Alineación y balanceo", quantity: 1, unit_price: 600, total_price: 600 },
    // ORD-0009
    { order_id: orders[8].id, type: "part", name: "Radiador de aluminio", quantity: 1, unit_price: 3500, total_price: 3500 },
    { order_id: orders[8].id, type: "part", name: "Mangueras superiores e inferiores", quantity: 2, unit_price: 500, total_price: 1000 },
    { order_id: orders[8].id, type: "labor", name: "Cambio de radiador", quantity: 1, unit_price: 2200, total_price: 2200 },
    // ORD-0010
    { order_id: orders[9].id, type: "part", name: "Bomba de agua", quantity: 1, unit_price: 1800, total_price: 1800 },
    { order_id: orders[9].id, type: "part", name: "Termostato", quantity: 1, unit_price: 450, total_price: 450 },
    { order_id: orders[9].id, type: "part", name: "Anticongelante", quantity: 3, unit_price: 183, total_price: 550 },
    { order_id: orders[9].id, type: "labor", name: "Cambio de bomba y termostato", quantity: 1, unit_price: 1500, total_price: 1500 },
    // ORD-0011
    { order_id: orders[10].id, type: "part", name: "Sensor de oxígeno", quantity: 1, unit_price: 1800, total_price: 1800 },
    { order_id: orders[10].id, type: "labor", name: "Diagnóstico y cambio sensor O2", quantity: 1, unit_price: 900, total_price: 900 },
    // ORD-0012
    { order_id: orders[11].id, type: "part", name: "Kit de servicio 60k", quantity: 1, unit_price: 3500, total_price: 3500 },
    { order_id: orders[11].id, type: "labor", name: "Servicio mayor completo", quantity: 1, unit_price: 2500, total_price: 2500 },
    // ORD-0014
    { order_id: orders[13].id, type: "part", name: "Batería LTH", quantity: 1, unit_price: 2200, total_price: 2200 },
    { order_id: orders[13].id, type: "labor", name: "Instalación y revisión eléctrica", quantity: 1, unit_price: 500, total_price: 500 },
    // ORD-0015
    { order_id: orders[14].id, type: "part", name: "Kit de distribución completo", quantity: 1, unit_price: 5500, total_price: 5500 },
    { order_id: orders[14].id, type: "labor", name: "Cambio de distribución", quantity: 1, unit_price: 3000, total_price: 3000 },
    // ORD-0016
    { order_id: orders[15].id, type: "part", name: "Material de pintura", quantity: 1, unit_price: 1500, total_price: 1500 },
    { order_id: orders[15].id, type: "labor", name: "Preparación y pintura lateral", quantity: 1, unit_price: 4000, total_price: 4000 },
    // ORD-0017
    { order_id: orders[16].id, type: "part", name: "Aceite sintético 5W-30", quantity: 4, unit_price: 180, total_price: 720 },
    { order_id: orders[16].id, type: "part", name: "Filtro de aceite", quantity: 1, unit_price: 80, total_price: 80 },
    { order_id: orders[16].id, type: "labor", name: "Cambio de aceite y filtros", quantity: 1, unit_price: 400, total_price: 400 },
    // ORD-0018
    { order_id: orders[17].id, type: "labor", name: "Diagnóstico de fuga de aceite", quantity: 1, unit_price: 800, total_price: 800 },
  ];
  await admin.from("order_items").insert(items);

  // Status events for all orders
  const statusFlow: Record<string, string[]> = {
    recibido: ["recibido"],
    diagnostico: ["recibido", "diagnostico"],
    cotizado: ["recibido", "diagnostico", "cotizado"],
    aprobado: ["recibido", "diagnostico", "cotizado", "aprobado"],
    en_reparacion: ["recibido", "diagnostico", "cotizado", "aprobado", "en_reparacion"],
    listo: ["recibido", "diagnostico", "cotizado", "aprobado", "en_reparacion", "listo"],
    entregado: ["recibido", "diagnostico", "cotizado", "aprobado", "en_reparacion", "listo", "entregado"],
  };

  const events: any[] = [];
  for (const order of orders) {
    const flow = statusFlow[order.status] || ["recibido"];
    const createdAt = new Date(order.created_at || now.toISOString());
    flow.forEach((s, i) => {
      const eventDate = new Date(createdAt.getTime() + i * 4 * 3600000); // 4 hours apart
      events.push({ order_id: order.id, status: s, created_at: eventDate.toISOString() });
    });
  }
  await admin.from("order_status_events").insert(events);

  // Fiados - 10 varied
  const fiados = [
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[1].id, order_id: orders[1].id, total_amount: 1970, paid_amount: 0, balance_due: 1970, due_date: daysAgo(-20).split("T")[0], status: "pendiente" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[4].id, order_id: orders[4].id, total_amount: 2450, paid_amount: 1000, balance_due: 1450, due_date: daysAgo(-3).split("T")[0], status: "por_vencer" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[2].id, order_id: orders[2].id, total_amount: 600, paid_amount: 0, balance_due: 600, due_date: daysAgo(10).split("T")[0], status: "vencido" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[3].id, order_id: orders[3].id, total_amount: 11200, paid_amount: 0, balance_due: 11200, due_date: daysAgo(-30).split("T")[0], status: "pendiente" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[8].id, order_id: orders[9].id, total_amount: 2300, paid_amount: 2000, balance_due: 300, due_date: daysAgo(-5).split("T")[0], status: "por_vencer" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[5].id, order_id: orders[14].id, total_amount: 4500, paid_amount: 4000, balance_due: 500, due_date: daysAgo(-2).split("T")[0], status: "por_vencer" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[6].id, total_amount: 1500, paid_amount: 1500, balance_due: 0, due_date: daysAgo(15).split("T")[0], status: "pagado" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[7].id, order_id: orders[8].id, total_amount: 6700, paid_amount: 0, balance_due: 6700, due_date: daysAgo(-15).split("T")[0], status: "pendiente" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[9].id, total_amount: 2000, paid_amount: 2000, balance_due: 0, due_date: daysAgo(20).split("T")[0], status: "pagado" },
    { id: crypto.randomUUID(), shop_id: shopId, customer_id: customers[10].id, total_amount: 800, paid_amount: 0, balance_due: 800, due_date: daysAgo(5).split("T")[0], status: "vencido" },
  ];
  await admin.from("fiados").insert(fiados);

  // Fiado payments
  const fiadoPayments = [
    { fiado_id: fiados[1].id, amount: 500, payment_date: daysAgo(8).split("T")[0], method: "efectivo", note: "Primer abono" },
    { fiado_id: fiados[1].id, amount: 500, payment_date: daysAgo(4).split("T")[0], method: "transferencia", note: "Segundo abono" },
    { fiado_id: fiados[4].id, amount: 1000, payment_date: daysAgo(7).split("T")[0], method: "efectivo", note: "Abono parcial" },
    { fiado_id: fiados[4].id, amount: 1000, payment_date: daysAgo(3).split("T")[0], method: "tarjeta", note: "Segundo pago" },
    { fiado_id: fiados[5].id, amount: 2000, payment_date: daysAgo(6).split("T")[0], method: "transferencia", note: "Anticipo" },
    { fiado_id: fiados[5].id, amount: 2000, payment_date: daysAgo(2).split("T")[0], method: "efectivo", note: "Segundo pago grande" },
    { fiado_id: fiados[6].id, amount: 800, payment_date: daysAgo(18).split("T")[0], method: "efectivo", note: "Primer abono" },
    { fiado_id: fiados[6].id, amount: 700, payment_date: daysAgo(12).split("T")[0], method: "transferencia", note: "Liquidación" },
    { fiado_id: fiados[8].id, amount: 1000, payment_date: daysAgo(25).split("T")[0], method: "efectivo", note: "Primer pago" },
    { fiado_id: fiados[8].id, amount: 1000, payment_date: daysAgo(18).split("T")[0], method: "efectivo", note: "Liquidación total" },
  ];
  await admin.from("fiado_payments").insert(fiadoPayments);

  // Products - 20
  const products = [
    { shop_id: shopId, name: "Aceite sintético 5W-30", sku: "ACE-001", category: "Lubricantes", unit: "litro", cost: 120, price: 180, stock_qty: 12, min_qty: 5 },
    { shop_id: shopId, name: "Aceite semi-sintético 10W-40", sku: "ACE-002", category: "Lubricantes", unit: "litro", cost: 90, price: 140, stock_qty: 8, min_qty: 5 },
    { shop_id: shopId, name: "Filtro de aceite universal", sku: "FIL-001", category: "Filtros", unit: "pieza", cost: 45, price: 85, stock_qty: 8, min_qty: 3 },
    { shop_id: shopId, name: "Filtro de aire", sku: "FIL-002", category: "Filtros", unit: "pieza", cost: 80, price: 150, stock_qty: 5, min_qty: 3 },
    { shop_id: shopId, name: "Balatas delanteras cerámicas", sku: "BAL-001", category: "Frenos", unit: "juego", cost: 450, price: 850, stock_qty: 2, min_qty: 3 },
    { shop_id: shopId, name: "Balatas traseras semi-metálicas", sku: "BAL-002", category: "Frenos", unit: "juego", cost: 380, price: 650, stock_qty: 3, min_qty: 2 },
    { shop_id: shopId, name: "Bujías de iridio NGK", sku: "BUJ-001", category: "Encendido", unit: "pieza", cost: 95, price: 180, stock_qty: 16, min_qty: 8 },
    { shop_id: shopId, name: "Bujías estándar Champion", sku: "BUJ-002", category: "Encendido", unit: "pieza", cost: 35, price: 70, stock_qty: 20, min_qty: 10 },
    { shop_id: shopId, name: "Banda serpentina Gates", sku: "BAN-001", category: "Bandas", unit: "pieza", cost: 180, price: 350, stock_qty: 1, min_qty: 2 },
    { shop_id: shopId, name: "Líquido de frenos DOT 4", sku: "LIQ-001", category: "Lubricantes", unit: "litro", cost: 65, price: 120, stock_qty: 6, min_qty: 3 },
    { shop_id: shopId, name: "Anticongelante verde", sku: "ANT-001", category: "Lubricantes", unit: "litro", cost: 55, price: 95, stock_qty: 4, min_qty: 4 },
    { shop_id: shopId, name: "Disco de freno ventilado", sku: "DIS-001", category: "Frenos", unit: "pieza", cost: 350, price: 620, stock_qty: 0, min_qty: 2 },
    { shop_id: shopId, name: "Amortiguador Monroe delantero", sku: "AMO-001", category: "Suspensión", unit: "pieza", cost: 800, price: 1600, stock_qty: 2, min_qty: 2 },
    { shop_id: shopId, name: "Amortiguador Monroe trasero", sku: "AMO-002", category: "Suspensión", unit: "pieza", cost: 700, price: 1400, stock_qty: 1, min_qty: 2 },
    { shop_id: shopId, name: "Termostato universal", sku: "TER-001", category: "Motor", unit: "pieza", cost: 250, price: 450, stock_qty: 3, min_qty: 2 },
    { shop_id: shopId, name: "Bomba de agua", sku: "BOM-001", category: "Motor", unit: "pieza", cost: 900, price: 1800, stock_qty: 1, min_qty: 1 },
    { shop_id: shopId, name: "Batería LTH L-47-575", sku: "BAT-001", category: "Eléctrico", unit: "pieza", cost: 1400, price: 2200, stock_qty: 2, min_qty: 1 },
    { shop_id: shopId, name: "Sensor de oxígeno Bosch", sku: "SEN-001", category: "Sensores", unit: "pieza", cost: 900, price: 1800, stock_qty: 0, min_qty: 1 },
    { shop_id: shopId, name: "Focos H7 Osram", sku: "FOC-001", category: "Eléctrico", unit: "par", cost: 150, price: 280, stock_qty: 6, min_qty: 3 },
    { shop_id: shopId, name: "Limpiador de inyectores", sku: "LIM-001", category: "Aditivos", unit: "pieza", cost: 120, price: 220, stock_qty: 4, min_qty: 3 },
  ];
  await admin.from("products").insert(products);

  // Reminders
  await admin.from("reminders").insert([
    { shop_id: shopId, customer_id: customers[0].id, vehicle_id: vehicles[0].id, type: "service", title: "Cambio de aceite programado", due_at: daysAgo(-2), status: "pending" },
    { shop_id: shopId, customer_id: customers[3].id, vehicle_id: vehicles[4].id, type: "followup", title: "Seguimiento cotización clutch", due_at: daysAgo(-7), status: "pending" },
    { shop_id: shopId, customer_id: customers[2].id, type: "payment", title: "Cobro de fío vencido - Carlos Hernández", due_at: daysAgo(0), status: "pending" },
    { shop_id: shopId, customer_id: customers[7].id, vehicle_id: vehicles[8].id, type: "followup", title: "Confirmar aprobación de radiador", due_at: daysAgo(-1), status: "pending" },
    { shop_id: shopId, customer_id: customers[10].id, type: "payment", title: "Cobro vencido - Fernando Ortiz", due_at: daysAgo(0), status: "pending" },
  ]);

  return new Response(JSON.stringify({
    success: true,
    userId,
    email: EMAIL,
    password: PASSWORD,
    message: "Demo user created with rich seed data. Login with cazzzaresss@gmail.com / TallioDemo123!"
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
