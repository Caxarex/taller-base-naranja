
-- updated_at triggers
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_shops BEFORE UPDATE ON public.shops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_customers BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_vehicles BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER set_updated_at_fiados BEFORE UPDATE ON public.fiados FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recalculate order totals on item changes
CREATE TRIGGER recalc_order_totals_insert AFTER INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.recalculate_order_totals();
CREATE TRIGGER recalc_order_totals_update AFTER UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.recalculate_order_totals();
CREATE TRIGGER recalc_order_totals_delete AFTER DELETE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.recalculate_order_totals();

-- Recalculate fiado balance on payment changes
CREATE TRIGGER recalc_fiado_balance_insert AFTER INSERT ON public.fiado_payments FOR EACH ROW EXECUTE FUNCTION public.recalculate_fiado_balance();
CREATE TRIGGER recalc_fiado_balance_update AFTER UPDATE ON public.fiado_payments FOR EACH ROW EXECUTE FUNCTION public.recalculate_fiado_balance();
CREATE TRIGGER recalc_fiado_balance_delete AFTER DELETE ON public.fiado_payments FOR EACH ROW EXECUTE FUNCTION public.recalculate_fiado_balance();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_shop_status ON public.orders(shop_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_public_code ON public.orders(public_code);
CREATE INDEX IF NOT EXISTS idx_fiados_shop_status ON public.fiados(shop_id, status);
CREATE INDEX IF NOT EXISTS idx_fiados_due_date ON public.fiados(due_date);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON public.vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_products_shop_active ON public.products(shop_id, active);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_events_order ON public.order_status_events(order_id);
CREATE INDEX IF NOT EXISTS idx_fiado_payments_fiado ON public.fiado_payments(fiado_id);
CREATE INDEX IF NOT EXISTS idx_shop_members_user ON public.shop_members(user_id, status);
