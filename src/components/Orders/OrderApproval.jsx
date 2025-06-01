// src/components/Orders/OrderApproval.jsx

import { useEffect, useState } from 'react';
import { supabase }            from '../../supabase/client';

export default function OrderApproval() {
  const [orders, setOrders] = useState([]);
  const businessId         = localStorage.getItem('business_id');

  // ─────────── LOAD PENDING ORDERS ON MOUNT ───────────
  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    // Fetch all orders where approved = false, for this business
    const { data, error } = await supabase
      .from('orders')
      .select('id, quantity, order_template_id, predefined_orders(name)')
      .eq('business_id', businessId)
      .eq('approved', false);

    if (error) {
      console.error('Error loading pending orders:', error.message);
      setOrders([]);
    } else {
      setOrders(data || []);
    }
  }

  // ─────────── APPROVE AN ORDER ───────────
  async function approve(o) {
    // 1) Mark the order approved
    const { error: updErr } = await supabase
      .from('orders')
      .update({ approved: true })
      .eq('id', o.id);

    if (updErr) {
      console.error('Error approving order:', updErr.message);
      return;
    }

    // 2) Fetch all items in the template
    const { data: tmpl, error: tmplErr } = await supabase
      .from('order_templates')
      .select('item_id, quantity_per_order')
      .eq('order_id', o.order_template_id);

    if (tmplErr) {
      console.error('Error fetching template rows:', tmplErr.message);
      return;
    }

    // 3) Deduct inventory for each item (quantity_per_order * order.quantity)
    for (const t of tmpl || []) {
      const totalQty = t.quantity_per_order * o.quantity;

      // If you have a Postgres function `deduct_inventory(item_id, qty)`,
      // you can call it like this:
      const { error: rpcErr } = await supabase.rpc('deduct_inventory', {
        _item_id: t.item_id,
        _qty:     totalQty
      });

      if (rpcErr) {
        // If no RPC, fallback to manual update on `inventory_items`
        await supabase
          .from('inventory_items')
          .update({
            quantity: supabase.literal(
              `quantity - ${totalQty}`
            )
          })
          .eq('id', t.item_id);
      }
    }

    // 4) Reload the pending list
    loadPending();
  }

  return (
    <div className="container py-4">
      <h2>Pending Orders</h2>

      {orders.length === 0 ? (
        <p className="mt-3 text-center">No pending orders.</p>
      ) : (
        <ul className="list-group mt-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>
                {o.predefined_orders.name} × {o.quantity}
              </span>
              <button
                className="btn btn-success btn-sm"
                onClick={() => approve(o)}
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
