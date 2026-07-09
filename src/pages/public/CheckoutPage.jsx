import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { useSiteData } from './PublicLayout';
import { ShoppingBag, Truck, MapPin, Phone, Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const siteData = useSiteData();
  const settings = siteData?.settings || {};
  const shopEnabled =
    settings.shop_enabled === 'true' ||
    settings.shop_enabled === true ||
    settings.shop_enabled === '1' ||
    settings.shop_enabled === 1;
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    city: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!shopEnabled) {
      navigate('/shop');
      return;
    }
    const savedCart = localStorage.getItem('shop_cart');
    if (!savedCart) {
      navigate('/shop');
      return;
    }
    setCart(JSON.parse(savedCart));
    setLoading(false);
  }, [shopEnabled, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const orderData = {
        ...form,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          selected_attributes: item.selected_attributes || {},
        })),
      };

      const res = await api.post('/shop/orders', orderData);
      setOrderNumber(res.data.order_number);
      setOrderSuccess(true);
      localStorage.removeItem('shop_cart');
      window.dispatchEvent(new Event('cart-updated'));
      setCart([]);
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
      else alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.final_price * item.quantity, 0);
  const discountAmount = cart.reduce((sum, item) => sum + (item.price - item.final_price) * item.quantity, 0);
  const deliveryFee = 200;
  const total = cartTotal - discountAmount + deliveryFee;

  const inputClass = 'w-full px-4 py-3 bg-[oklch(0.13_0.02_30/0.6)] border border-[var(--forge-border)] rounded-lg text-[var(--forge-fg)] placeholder-[var(--forge-muted)] focus:border-[var(--forge-primary)] focus:ring-1 focus:ring-[var(--forge-primary)] outline-none transition-all';
  const labelClass = 'block text-sm font-semibold uppercase tracking-wider text-[var(--forge-fg)] mb-2';
  const errorClass = 'text-xs text-red-400 mt-1';

  if (!shopEnabled) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--forge-primary)]" />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-[oklch(0.12_0.01_40/0.8)] border border-[var(--forge-border)] rounded-2xl p-12">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-black uppercase text-[var(--forge-fg)] mb-4" style={{ fontFamily: 'Orbitron, system-ui' }}>
              Order Placed!
            </h1>
            <p className="text-lg text-[var(--forge-muted)] mb-2">
              Your order <span className="font-bold text-[var(--forge-primary)]">#{orderNumber}</span> has been received.
            </p>
            <p className="text-[var(--forge-muted)] mb-8">
              We will contact you via WhatsApp to confirm your order and arrange delivery.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-forge text-[var(--forge-primary-fg)] shadow-ember px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.6_0.25_30/0.2),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <Link to="/shop" className="inline-flex items-center gap-2 text-[var(--forge-muted)] hover:text-[var(--forge-fg)] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <div className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--forge-primary)]">Checkout</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-black uppercase" style={{ fontFamily: 'Orbitron, system-ui' }}>
            Complete Your Order
          </h1>
        </div>
      </section>

      {/* Checkout content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout form */}
            <div className="lg:col-span-2">
              <div className="bg-[oklch(0.12_0.01_40/0.6)] border border-[var(--forge-border)] rounded-xl p-6">
                <h2 className="text-xl font-bold text-[var(--forge-fg)] mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[var(--forge-primary)]" /> Delivery Information
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Full Name *</label>
                      <input
                        type="text"
                        value={form.customer_name}
                        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                        className={inputClass}
                        required
                      />
                      {errors.customer_name && <p className={errorClass}>{errors.customer_name[0]}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number *</label>
                      <input
                        type="tel"
                        value={form.customer_phone}
                        onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                        className={inputClass}
                        required
                      />
                      {errors.customer_phone && <p className={errorClass}>{errors.customer_phone[0]}</p>}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email (Optional)</label>
                    <input
                      type="email"
                      value={form.customer_email}
                      onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                      className={inputClass}
                    />
                    {errors.customer_email && <p className={errorClass}>{errors.customer_email[0]}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Delivery Address *</label>
                    <input
                      type="text"
                      value={form.delivery_address}
                      onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                      className={inputClass}
                      required
                    />
                    {errors.delivery_address && <p className={errorClass}>{errors.delivery_address[0]}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>City *</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className={inputClass}
                      required
                    />
                    {errors.city && <p className={errorClass}>{errors.city[0]}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Additional Notes (Optional)</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className={inputClass}
                      rows="3"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-forge text-[var(--forge-primary-fg)] shadow-ember py-4 rounded-lg font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</> : 'Place Order'}
                  </button>
                </form>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-[oklch(0.12_0.01_40/0.6)] border border-[var(--forge-border)] rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold text-[var(--forge-fg)] mb-6 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[var(--forge-primary)]" /> Order Summary
                </h2>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.cart_line_id || item.id} className="flex gap-4">
                      {item.main_image && (
                        <img src={item.main_image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-[var(--forge-fg)] text-sm">{item.name}</h4>
                        {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                          <p className="text-[var(--forge-muted)] text-xs">
                            {Object.entries(item.selected_attributes).map(([name, value]) => `${name}: ${value}`).join(' | ')}
                          </p>
                        )}
                        <p className="text-[var(--forge-muted)] text-xs">Qty: {item.quantity}</p>
                        <p className="text-[var(--forge-primary)] font-bold">Rs. {item.final_price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--forge-border)] pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-[var(--forge-muted)]">
                    <span>Subtotal</span>
                    <span>Rs. {cartTotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span>Discount</span>
                      <span>-Rs. {discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-[var(--forge-muted)]">
                    <span>Delivery Fee</span>
                    <span>Rs. {deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-[var(--forge-fg)] pt-2 border-t border-[var(--forge-border)]">
                    <span>Total</span>
                    <span>Rs. {total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
