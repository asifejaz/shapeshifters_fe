import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useSiteData } from './PublicLayout';
import { ShoppingBag, Plus, Minus, Trash2, X, Filter } from 'lucide-react';

export default function ShopPage() {
  const siteData = useSiteData();
  const settings = siteData?.settings || {};
  const shopEnabled = settings.shop_enabled === 'true' || settings.shop_enabled === true || settings.shop_enabled === '1' || settings.shop_enabled === 1;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [selectedProductImages, setSelectedProductImages] = useState(null);

  useEffect(() => {
    if (!shopEnabled) return;
    fetchProducts();
    fetchCategories();
    const savedCart = localStorage.getItem('shop_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, [shopEnabled]);

  const fetchProducts = () => {
    api.get('/shop/products?in_stock=1').then((res) => { setProducts(res.data); setLoading(false); });
  };

  const fetchCategories = () => {
    api.get('/shop/categories').then((res) => setCategories(res.data));
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let newCart;
      if (existing) {
        newCart = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item
        );
      } else {
        newCart = [...prev, { ...product, quantity: 1 }];
      }
      localStorage.setItem('shop_cart', JSON.stringify(newCart));
      window.dispatchEvent(new Event('cart-updated'));
      return newCart;
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) => {
      const newCart = prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: Math.min(newQty, item.stock) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
      localStorage.setItem('shop_cart', JSON.stringify(newCart));
      window.dispatchEvent(new Event('cart-updated'));
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const newCart = prev.filter((item) => item.id !== productId);
      localStorage.setItem('shop_cart', JSON.stringify(newCart));
      window.dispatchEvent(new Event('cart-updated'));
      return newCart;
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.final_price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

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
      {/* Page header */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.6_0.25_30/0.2),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--forge-primary)]">Shop</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-black uppercase" style={{ fontFamily: 'Orbitron, system-ui' }}>
            Our Products
          </h1>
          <p className="mt-4 text-lg text-[var(--forge-muted)] max-w-2xl">
            Browse our selection of fitness products and supplements.
          </p>
        </div>
      </section>

      {/* Shop content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-[oklch(0.12_0.01_40/0.6)] border border-[var(--forge-border)] rounded-xl p-6 sticky top-24">
                <h3 className="text-lg font-bold text-[var(--forge-fg)] mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" /> Categories
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === null
                          ? 'bg-[var(--forge-primary)] text-[var(--forge-primary-fg)] font-medium'
                          : 'text-[var(--forge-muted)] hover:text-[var(--forge-fg)] hover:bg-[oklch(0.15_0.02_40/0.6)]'
                      }`}
                    >
                      All Products
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-[var(--forge-primary)] text-[var(--forge-primary-fg)] font-medium'
                            : 'text-[var(--forge-muted)] hover:text-[var(--forge-fg)] hover:bg-[oklch(0.15_0.02_40/0.6)]'
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Products grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--forge-primary)]" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="w-16 h-16 text-[var(--forge-muted)] mx-auto mb-4 opacity-50" />
                  <p className="text-[var(--forge-muted)]">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-[oklch(0.12_0.01_40/0.6)] border border-[var(--forge-border)] rounded-xl overflow-hidden group">
                      <div className="relative aspect-square bg-[oklch(0.13_0.02_30/0.6)]">
                        {product.main_image ? (
                          <img src={product.main_image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--forge-muted)]">
                            <ShoppingBag className="w-16 h-16 opacity-50" />
                          </div>
                        )}
                        {product.images && product.images.length > 1 && (
                          <button
                            onClick={() => setSelectedProductImages(product.images)}
                            className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="p-4">
                        <Link to={`/shop/${product.slug}`} className="font-bold text-[var(--forge-fg)] mb-2 block hover:text-[var(--forge-primary)] transition-colors">{product.name}</Link>
                        <div className="flex items-center gap-2 mb-3">
                          {product.discount_price ? (
                            <>
                              <span className="text-lg font-bold text-[var(--forge-primary)]">Rs. {product.final_price}</span>
                              <span className="text-sm text-[var(--forge-muted)] line-through">Rs. {product.price}</span>
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                -{product.discount_percentage}%
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-[var(--forge-primary)]">Rs. {product.price}</span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--forge-muted)] mb-4">{product.description}</p>
                        <Link
                          to={`/shop/${product.slug}`}
                          className="inline-block text-sm font-semibold text-[var(--forge-primary)] hover:opacity-80 mb-4"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={!product.in_stock || product.stock === 0}
                          className="w-full bg-forge text-[var(--forge-primary-fg)] shadow-ember py-2 rounded-lg font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cart floating button */}
      {cartCount > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-[var(--forge-primary)] text-[var(--forge-primary-fg)] w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        </button>
      )}

      {/* Cart sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="relative ml-auto w-full max-w-md bg-[oklch(0.12_0.01_40/0.98)] border-l border-[var(--forge-border)] h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--forge-fg)]">Shopping Cart ({cartCount})</h2>
                <button onClick={() => setShowCart(false)} className="text-[var(--forge-muted)] hover:text-[var(--forge-fg)]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-[var(--forge-muted)] text-center py-12">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 bg-[oklch(0.13_0.02_30/0.6)] border border-[var(--forge-border)] rounded-lg p-4">
                        {item.main_image ? (
                          <img src={item.main_image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                        ) : (
                          <div className="w-20 h-20 bg-[oklch(0.13_0.02_30/0.6)] rounded flex items-center justify-center text-[var(--forge-muted)]">
                            <ShoppingBag className="w-8 h-8 opacity-50" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-[var(--forge-fg)] mb-1">{item.name}</h4>
                          <p className="text-[var(--forge-primary)] font-bold">Rs. {item.final_price}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 bg-[var(--forge-border)] rounded flex items-center justify-center hover:bg-[var(--forge-primary)] hover:text-[var(--forge-primary-fg)] transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium text-[var(--forge-fg)]">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 bg-[var(--forge-border)] rounded flex items-center justify-center hover:bg-[var(--forge-primary)] hover:text-[var(--forge-primary-fg)] transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[var(--forge-border)] pt-4 mb-6">
                    <div className="flex justify-between text-lg font-bold text-[var(--forge-fg)]">
                      <span>Total</span>
                      <span>Rs. {cartTotal}</span>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    onClick={() => setShowCart(false)}
                    className="block w-full bg-forge text-[var(--forge-primary-fg)] shadow-ember py-3 rounded-lg font-bold uppercase tracking-wider text-center hover:opacity-90 transition-opacity"
                  >
                    Proceed to Checkout
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {selectedProductImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" onClick={() => setSelectedProductImages(null)}>
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedProductImages(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedProductImages[0]?.image_url}
              alt="Product"
              className="w-full max-h-[70vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-2 mt-4 justify-center">
              {selectedProductImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img.image_url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded cursor-pointer border-2 border-transparent hover:border-[var(--forge-primary)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newImages = [...selectedProductImages];
                    const [first] = newImages.splice(idx, 1);
                    setSelectedProductImages([first, ...newImages]);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
