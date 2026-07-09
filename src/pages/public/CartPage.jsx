import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useSiteData } from './PublicLayout';

const CART_KEY = 'shop_cart';

export default function CartPage() {
  const siteData = useSiteData();
  const settings = siteData?.settings || {};
  const shopEnabled =
    settings.shop_enabled === 'true' || settings.shop_enabled === true || settings.shop_enabled === '1' || settings.shop_enabled === 1;

  const [cart, setCart] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      setCart(raw ? JSON.parse(raw) : []);
    } catch {
      setCart([]);
    }
  }, []);

  const persistCart = (next) => {
    setCart(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = (productId, delta) => {
    const next = cart
      .map((item) => {
        const itemKey = item.cart_line_id || item.id;
        if (itemKey !== productId) return item;
        const quantity = Math.max(1, Math.min((item.quantity || 1) + delta, item.stock || (item.quantity || 1)));
        return { ...item, quantity };
      })
      .filter((item) => item.quantity > 0);

    persistCart(next);
  };

  const removeItem = (productId) => {
    persistCart(cart.filter((item) => (item.cart_line_id || item.id) !== productId));
  };

  const { total, count } = useMemo(() => {
    const values = cart.reduce(
      (acc, item) => {
        acc.total += (item.final_price || item.price || 0) * (item.quantity || 0);
        acc.count += item.quantity || 0;
        return acc;
      },
      { total: 0, count: 0 }
    );

    return values;
  }, [cart]);

  if (!shopEnabled) {
    return (
      <div className="py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-[var(--forge-muted)] mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-[var(--forge-fg)] mb-2">Shop is currently unavailable</h2>
        <p className="text-[var(--forge-muted)]">Please check back later.</p>
      </div>
    );
  }

  return (
    <div>
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.6_0.25_30/0.2),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <Link to="/shop" className="inline-flex items-center gap-2 text-[var(--forge-muted)] hover:text-[var(--forge-fg)] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
          <div className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--forge-primary)]">Cart</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-black uppercase" style={{ fontFamily: 'Orbitron, system-ui' }}>
            Your Cart ({count})
          </h1>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {cart.length === 0 ? (
            <div className="bg-[oklch(0.12_0.01_40/0.8)] border border-[var(--forge-border)] rounded-xl p-10 text-center">
              <ShoppingBag className="w-14 h-14 text-[var(--forge-muted)] mx-auto mb-4 opacity-50" />
              <p className="text-[var(--forge-muted)] mb-5">Your cart is empty.</p>
              <Link to="/shop" className="inline-block bg-forge text-[var(--forge-primary-fg)] shadow-ember px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-wider">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div key={item.cart_line_id || item.id} className="flex gap-4 bg-[oklch(0.12_0.01_40/0.7)] border border-[var(--forge-border)] rounded-xl p-4">
                    {item.main_image ? (
                      <img src={item.main_image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-[oklch(0.13_0.02_30/0.6)] flex items-center justify-center text-[var(--forge-muted)]">
                        <ShoppingBag className="w-8 h-8 opacity-50" />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-bold text-[var(--forge-fg)]">{item.name}</h3>
                      <p className="text-[var(--forge-primary)] font-bold mt-1">Rs. {item.final_price || item.price}</p>
                      {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                        <p className="text-xs text-[var(--forge-muted)] mt-1">
                          {Object.entries(item.selected_attributes).map(([name, value]) => `${name}: ${value}`).join(' | ')}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => updateQuantity(item.cart_line_id || item.id, -1)} className="w-8 h-8 bg-[var(--forge-border)] rounded flex items-center justify-center hover:bg-[var(--forge-primary)] hover:text-[var(--forge-primary-fg)] transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-[var(--forge-fg)]">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cart_line_id || item.id, 1)} className="w-8 h-8 bg-[var(--forge-border)] rounded flex items-center justify-center hover:bg-[var(--forge-primary)] hover:text-[var(--forge-primary-fg)] transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeItem(item.cart_line_id || item.id)} className="ml-auto text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[oklch(0.12_0.01_40/0.7)] border border-[var(--forge-border)] rounded-xl p-6 h-fit lg:sticky lg:top-24">
                <h2 className="text-xl font-bold text-[var(--forge-fg)] mb-4">Summary</h2>
                <div className="border-t border-[var(--forge-border)] pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold text-[var(--forge-fg)]">
                    <span>Total</span>
                    <span>Rs. {total}</span>
                  </div>
                </div>

                <Link to="/checkout" className="block w-full bg-forge text-[var(--forge-primary-fg)] shadow-ember py-3 rounded-lg font-bold uppercase tracking-wider text-center hover:opacity-90 transition-opacity">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
