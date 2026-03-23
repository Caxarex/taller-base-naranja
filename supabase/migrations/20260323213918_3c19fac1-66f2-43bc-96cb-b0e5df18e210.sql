
-- ============================================================
-- TALLIO — Full Schema v1
-- ============================================================

-- 1. Shared utility: updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- 2. PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. SHOPS
-- ============================================================
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'MX',
  theme_mode TEXT DEFAULT 'system',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. SHOP_MEMBERS (role system — separate from profiles)
-- ============================================================
CREATE TABLE public.shop_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'reception', 'mechanic')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shop_id, user_id)
);

ALTER TABLE public.shop_members ENABLE ROW LEVEL SECURITY;

-- Security definer: get user's shop IDs
CREATE OR REPLACE FUNCTION public.get_user_shop_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT shop_id FROM public.shop_members
  WHERE user_id = _user_id AND status = 'active';
$$;

-- Security definer: check user role in shop
CREATE OR REPLACE FUNCTION public.has_shop_role(_user_id UUID, _shop_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shop_members
    WHERE user_id = _user_id
      AND shop_id = _shop_id
      AND role = _role
      AND status = 'active'
  );
$$;

-- Security definer: check if user is member of shop
CREATE OR REPLACE FUNCTION public.is_shop_member(_user_id UUID, _shop_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shop_members
    WHERE user_id = _user_id
      AND shop_id = _shop_id
      AND status = 'active'
  );
$$;

-- Shops: members can view their shops
CREATE POLICY "Members can view their shops"
  ON public.shops FOR SELECT
  USING (id IN (SELECT public.get_user_shop_ids(auth.uid())));

-- Shops: authenticated users can create shops
CREATE POLICY "Authenticated users can create shops"
  ON public.shops FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Shops: owners can update their shops
CREATE POLICY "Owners can update their shops"
  ON public.shops FOR UPDATE
  USING (public.has_shop_role(auth.uid(), id, 'owner'));

-- Shop members: members can view members of their shops
CREATE POLICY "Members can view shop members"
  ON public.shop_members FOR SELECT
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

-- Shop members: owners can manage members
CREATE POLICY "Owners can insert shop members"
  ON public.shop_members FOR INSERT
  WITH CHECK (
    public.has_shop_role(auth.uid(), shop_id, 'owner')
    OR (auth.uid() = user_id AND role = 'owner')
  );

CREATE POLICY "Owners can update shop members"
  ON public.shop_members FOR UPDATE
  USING (public.has_shop_role(auth.uid(), shop_id, 'owner'));

CREATE POLICY "Owners can delete shop members"
  ON public.shop_members FOR DELETE
  USING (public.has_shop_role(auth.uid(), shop_id, 'owner'));

-- ============================================================
-- 5. CUSTOMERS
-- ============================================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view shop customers"
  ON public.customers FOR SELECT
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE POLICY "Members can insert shop customers"
  ON public.customers FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE POLICY "Members can update shop customers"
  ON public.customers FOR UPDATE
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 6. VEHICLES
-- ============================================================
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  plate TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT,
  color TEXT,
  vin TEXT,
  engine_type TEXT,
  last_km INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shop_id, plate)
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view shop vehicles"
  ON public.vehicles FOR SELECT
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE POLICY "Members can insert shop vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE POLICY "Members can update shop vehicles"
  ON public.vehicles FOR UPDATE
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 7. ORDERS
-- ============================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  assigned_member_id UUID REFERENCES auth.users(id),
  public_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'recibido' CHECK (status IN (
    'recibido','diagnostico','cotizado','aprobado',
    'en_reparacion','listo','entregado','rechazado','cancelado'
  )),
  problem_description TEXT,
  diagnosis TEXT,
  notes TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  labor_total NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  paid_total NUMERIC NOT NULL DEFAULT 0,
  balance_due NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view shop orders"
  ON public.orders FOR SELECT
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE POLICY "Members can insert shop orders"
  ON public.orders FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE POLICY "Members can update shop orders"
  ON public.orders FOR UPDATE
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 8. ORDER_STATUS_EVENTS
-- ============================================================
CREATE TABLE public.order_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view order events"
  ON public.order_status_events FOR SELECT
  USING (order_id IN (
    SELECT id FROM public.orders WHERE shop_id IN (SELECT public.get_user_shop_ids(auth.uid()))
  ));

CREATE POLICY "Members can insert order events"
  ON public.order_status_events FOR INSERT
  WITH CHECK (order_id IN (
    SELECT id FROM public.orders WHERE shop_id IN (SELECT public.get_user_shop_ids(auth.uid()))
  ));

-- ============================================================
-- 9. ORDER_ITEMS
-- ============================================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('part', 'labor')),
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  source_product_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view order items"
  ON public.order_items FOR SELECT
  USING (order_id IN (
    SELECT id FROM public.orders WHERE shop_id IN (SELECT public.get_user_shop_ids(auth.uid()))
  ));

CREATE POLICY "Members can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (order_id IN (
    SELECT id FROM public.orders WHERE shop_id IN (SELECT public.get_user_shop_ids(auth.uid()))
  ));

CREATE POLICY "Members can update order items"
  ON public.order_items FOR UPDATE
  USING (order_id IN (
    SELECT id FROM public.orders WHERE shop_id IN (SELECT public.get_user_shop_ids(auth.uid()))
  ));

CREATE POLICY "Members can delete order items"
  ON public.order_items FOR DELETE
  USING (order_id IN (
    SELECT id FROM public.orders WHERE shop_id IN (SELECT public.get_user_shop_ids(auth.uid()))
  ));

-- ============================================================
-- 10. FIADOS
-- ============================================================
CREATE TABLE public.fiados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  order_id UUID REFERENCES public.orders(id),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  balance_due NUMERIC NOT NULL DEFAULT 0,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','por_vencer','vencido','pagado')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fiados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view shop fiados"
  ON public.fiados FOR SELECT
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE POLICY "Members can insert shop fiados"
  ON public.fiados FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE POLICY "Members can update shop fiados"
  ON public.fiados FOR UPDATE
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE TRIGGER update_fiados_updated_at
  BEFORE UPDATE ON public.fiados
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 11. FIADO_PAYMENTS
-- ============================================================
CREATE TABLE public.fiado_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiado_id UUID NOT NULL REFERENCES public.fiados(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT,
  note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fiado_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view fiado payments"
  ON public.fiado_payments FOR SELECT
  USING (fiado_id IN (
    SELECT id FROM public.fiados WHERE shop_id IN (SELECT public.get_user_shop_ids(auth.uid()))
  ));

CREATE POLICY "Members can insert fiado payments"
  ON public.fiado_payments FOR INSERT
  WITH CHECK (fiado_id IN (
    SELECT id FROM public.fiados WHERE shop_id IN (SELECT public.get_user_shop_ids(auth.uid()))
  ));

-- ============================================================
-- 12. PRODUCTS
-- ============================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  unit TEXT,
  cost NUMERIC DEFAULT 0,
  price NUMERIC DEFAULT 0,
  stock_qty NUMERIC DEFAULT 0,
  min_qty NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view shop products"
  ON public.products FOR SELECT
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE POLICY "Members can insert shop products"
  ON public.products FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE POLICY "Members can update shop products"
  ON public.products FOR UPDATE
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 13. INVENTORY_MOVEMENTS
-- ============================================================
CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in','out','adjustment','reserved')),
  quantity NUMERIC NOT NULL,
  note TEXT,
  related_order_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view shop inventory movements"
  ON public.inventory_movements FOR SELECT
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE POLICY "Members can insert shop inventory movements"
  ON public.inventory_movements FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

-- ============================================================
-- 14. REMINDERS
-- ============================================================
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  type TEXT,
  title TEXT NOT NULL,
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','done','cancelled')),
  channel TEXT DEFAULT 'whatsapp',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view shop reminders"
  ON public.reminders FOR SELECT
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE POLICY "Members can insert shop reminders"
  ON public.reminders FOR INSERT
  WITH CHECK (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

CREATE POLICY "Members can update shop reminders"
  ON public.reminders FOR UPDATE
  USING (shop_id IN (SELECT public.get_user_shop_ids(auth.uid())));

-- ============================================================
-- 15. PUBLIC TRACKING (RPC function — no direct table access)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_public_tracking(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'order', json_build_object(
      'public_code', o.public_code,
      'status', o.status,
      'problem_description', o.problem_description,
      'subtotal', o.subtotal,
      'labor_total', o.labor_total,
      'total', o.total,
      'paid_total', o.paid_total,
      'balance_due', o.balance_due,
      'created_at', o.created_at
    ),
    'vehicle', json_build_object(
      'plate', v.plate,
      'make', v.make,
      'model', v.model,
      'year', v.year,
      'color', v.color
    ),
    'shop', json_build_object(
      'name', s.name,
      'phone', s.phone
    ),
    'timeline', (
      SELECT COALESCE(json_agg(json_build_object(
        'status', e.status,
        'created_at', e.created_at
      ) ORDER BY e.created_at ASC), '[]'::json)
      FROM public.order_status_events e WHERE e.order_id = o.id
    ),
    'items', (
      SELECT COALESCE(json_agg(json_build_object(
        'type', i.type,
        'name', i.name,
        'quantity', i.quantity,
        'unit_price', i.unit_price,
        'total_price', i.total_price
      )), '[]'::json)
      FROM public.order_items i WHERE i.order_id = o.id
    )
  ) INTO result
  FROM public.orders o
  LEFT JOIN public.vehicles v ON v.id = o.vehicle_id
  LEFT JOIN public.shops s ON s.id = o.shop_id
  WHERE LOWER(o.public_code) = LOWER(p_code);

  RETURN result;
END;
$$;

-- ============================================================
-- 16. TRIGGERS: recalculate order totals
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalculate_order_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal NUMERIC;
  v_labor NUMERIC;
BEGIN
  SELECT
    COALESCE(SUM(total_price) FILTER (WHERE type = 'part'), 0),
    COALESCE(SUM(total_price) FILTER (WHERE type = 'labor'), 0)
  INTO v_subtotal, v_labor
  FROM public.order_items
  WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);

  UPDATE public.orders SET
    subtotal = v_subtotal,
    labor_total = v_labor,
    total = v_subtotal + v_labor,
    balance_due = (v_subtotal + v_labor) - paid_total
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER recalc_order_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_order_totals();

-- ============================================================
-- 17. TRIGGERS: recalculate fiado on payment
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalculate_fiado_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_paid NUMERIC;
  v_total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_paid
  FROM public.fiado_payments
  WHERE fiado_id = COALESCE(NEW.fiado_id, OLD.fiado_id);

  SELECT total_amount INTO v_total
  FROM public.fiados
  WHERE id = COALESCE(NEW.fiado_id, OLD.fiado_id);

  UPDATE public.fiados SET
    paid_amount = v_paid,
    balance_due = v_total - v_paid,
    status = CASE
      WHEN v_paid >= v_total THEN 'pagado'
      ELSE status
    END
  WHERE id = COALESCE(NEW.fiado_id, OLD.fiado_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER recalc_fiado_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON public.fiado_payments
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_fiado_balance();

-- ============================================================
-- 18. INDEXES
-- ============================================================
CREATE INDEX idx_shop_members_user ON public.shop_members(user_id);
CREATE INDEX idx_shop_members_shop ON public.shop_members(shop_id);
CREATE INDEX idx_customers_shop ON public.customers(shop_id);
CREATE INDEX idx_vehicles_shop ON public.vehicles(shop_id);
CREATE INDEX idx_vehicles_plate ON public.vehicles(plate);
CREATE INDEX idx_orders_shop ON public.orders(shop_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_public_code ON public.orders(public_code);
CREATE INDEX idx_order_status_events_order ON public.order_status_events(order_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_fiados_shop ON public.fiados(shop_id);
CREATE INDEX idx_fiados_status ON public.fiados(status);
CREATE INDEX idx_fiados_due_date ON public.fiados(due_date);
CREATE INDEX idx_fiado_payments_fiado ON public.fiado_payments(fiado_id);
CREATE INDEX idx_products_shop ON public.products(shop_id);
CREATE INDEX idx_inventory_movements_product ON public.inventory_movements(product_id);
CREATE INDEX idx_reminders_shop ON public.reminders(shop_id);
CREATE INDEX idx_reminders_status ON public.reminders(status);
