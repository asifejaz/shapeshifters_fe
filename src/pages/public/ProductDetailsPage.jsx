import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import api from '../../api';
import { useSiteData } from './PublicLayout';

const CART_KEY = 'shop_cart';

const resolveImageUrl = (img) => {
  if (!img) return null;
  if (img.image_url) return img.image_url;
  if (img.image) {
    if (img.image.startsWith('http://') || img.image.startsWith('https://')) return img.image;
    return `/storage/${img.image.replace(/^\/+/, '')}`;
  }
  return null;
};

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const siteData = useSiteData();
  const settings = siteData?.settings || {};
  const shopEnabled =
    settings.shop_enabled === 'true' || settings.shop_enabled === true || settings.shop_enabled === '1' || settings.shop_enabled === 1;

  const [product, setProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [zoomOpen, setZoomOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shopEnabled) return;

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/shop/products/${slug}`);
        setProduct(res.data);
      } catch {
        setError('Product not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, shopEnabled]);

  const images = useMemo(() => {
    if (!product) return [];
    if (product.images?.length) return product.images.map((img) => ({ ...img, image_url: resolveImageUrl(img) })).filter((img) => img.image_url);
    if (product.main_image) return [{ image_url: product.main_image }];
    return [];
  }, [product]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [slug, images.length]);

  const productAttributes = useMemo(() => {
    if (!Array.isArray(product?.attributes)) return [];
    return product.attributes.filter((attr) => attr?.name && Array.isArray(attr.values) && attr.values.length > 0);
  }, [product]);

  useEffect(() => {
    const defaults = {};
    productAttributes.forEach((attr) => {
      defaults[attr.name] = attr.values[0];
    });
    setSelectedAttributes(defaults);
  }, [productAttributes]);

  const attributesValid = useMemo(
    () => productAttributes.every((attr) => selectedAttributes[attr.name]),
    [productAttributes, selectedAttributes]
  );

  const addToCart = () => {
    if (!product) return;

    const raw = localStorage.getItem(CART_KEY);
    const cart = raw ? JSON.parse(raw) : [];

    const lineAttributes = { ...selectedAttributes };
    const lineId = `${product.id}::${JSON.stringify(lineAttributes)}`;
    const existing = cart.find((item) => item.cart_line_id === lineId);
    const maxStock = product.stock || 0;

    let newCart;
    if (existing) {
      newCart = cart.map((item) => {
        if (item.cart_line_id !== lineId) return item;
        const nextQty = Math.min(item.quantity + quantity, maxStock);
        return { ...item, quantity: Math.max(1, nextQty) };
      });
    } else {
      newCart = [
        ...cart,
        {
          ...product,
          cart_line_id: lineId,
          selected_attributes: lineAttributes,
          quantity: Math.min(quantity, maxStock || quantity),
        },
      ];
    }

    localStorage.setItem(CART_KEY, JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  if (!shopEnabled) {
    return (
      <div className="py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-[var(--forge-muted)] mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold text-[var(--forge-fg)] mb-2">Shop is currently unavailable</h2>
        <p className="text-[var(--forge-muted)]">Please check back later.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--forge-primary)]" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 max-w-7xl mx-auto px-4">
        <Link to="/shop" className="inline-flex items-center gap-2 text-[var(--forge-muted)] hover:text-[var(--forge-fg)] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
        <div className="bg-[oklch(0.12_0.01_40/0.8)] border border-[var(--forge-border)] rounded-xl p-8 text-center">
          <p className="text-[var(--forge-muted)]">{error || 'Product not found.'}</p>
        </div>
      </div>
    );
  }

  const activeImage = images[activeImageIndex]?.image_url;

  return (
    <div>
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 grid-lines opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.6_0.25_30/0.2),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <Link to="/shop" className="inline-flex items-center gap-2 text-[var(--forge-muted)] hover:text-[var(--forge-fg)] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <div className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--forge-primary)]">Product Details</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-black uppercase" style={{ fontFamily: 'Orbitron, system-ui' }}>
            {product.name}
          </h1>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
            <div>
              <button
                onClick={() => activeImage && setZoomOpen(true)}
                className="w-full aspect-square rounded-2xl overflow-hidden border border-[var(--forge-border)] bg-[oklch(0.13_0.02_30/0.6)]"
              >
                {activeImage ? (
                  <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--forge-muted)]">
                    <ShoppingBag className="w-16 h-16 opacity-50" />
                  </div>
                )}
              </button>

              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {images.map((img, index) => (
                    <button
                      key={`${img.id || index}-${index}`}
                      onClick={() => setActiveImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border transition-all ${
                        index === activeImageIndex
                          ? 'border-[var(--forge-primary)] ring-1 ring-[var(--forge-primary)]'
                          : 'border-[var(--forge-border)] hover:border-[var(--forge-primary)]'
                      }`}
                      aria-label={`View product image ${index + 1}`}
                    >
                      <img src={img.image_url} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[oklch(0.12_0.01_40/0.6)] border border-[var(--forge-border)] rounded-xl p-6 md:p-8 h-fit">
              <div className="text-sm uppercase tracking-wider text-[var(--forge-muted)] mb-2">{product.category?.name || 'Fitness Product'}</div>
              <h2 className="text-3xl font-black text-[var(--forge-fg)] mb-4" style={{ fontFamily: 'Orbitron, system-ui' }}>
                {product.name}
              </h2>

              <div className="flex items-center gap-3 mb-4">
                {product.discount_price ? (
                  <>
                    <span className="text-3xl font-black text-[var(--forge-primary)]">Rs. {product.final_price}</span>
                    <span className="text-lg text-[var(--forge-muted)] line-through">Rs. {product.price}</span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">-{product.discount_percentage}%</span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-[var(--forge-primary)]">Rs. {product.price}</span>
                )}
              </div>

              <div className="text-[var(--forge-muted)] leading-relaxed mb-6">
                {product.description ? (
                  product.description.includes('<') ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p>{product.description}</p>
                  )
                ) : (
                  <p>No product description is available yet.</p>
                )}
              </div>

              {productAttributes.length > 0 && (
                <div className="space-y-4 mb-6">
                  {productAttributes.map((attr) => (
                    <div key={attr.name}>
                      <label className="block text-sm font-semibold text-[var(--forge-fg)] mb-2">{attr.name}</label>
                      <select
                        value={selectedAttributes[attr.name] || ''}
                        onChange={(e) => setSelectedAttributes((prev) => ({ ...prev, [attr.name]: e.target.value }))}
                        className="w-full px-3 py-2 bg-[oklch(0.13_0.02_30/0.6)] border border-[var(--forge-border)] rounded-lg text-[var(--forge-fg)]"
                      >
                        {attr.values.map((value) => (
                          <option key={`${attr.name}-${value}`} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="inline-flex items-center rounded-lg border border-[var(--forge-border)] overflow-hidden">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-2 hover:bg-[oklch(0.15_0.02_40/0.6)] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-[var(--forge-fg)]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => Math.min(product.stock || prev + 1, prev + 1))}
                    className="px-3 py-2 hover:bg-[oklch(0.15_0.02_40/0.6)] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className={`text-sm font-semibold ${product.in_stock && product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {product.in_stock && product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <button
                onClick={addToCart}
                disabled={!product.in_stock || product.stock === 0 || !attributesValid}
                className="w-full bg-forge text-[var(--forge-primary-fg)] shadow-ember py-3 rounded-lg font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Add to Cart
              </button>

              <Link
                to="/checkout"
                className="mt-3 block w-full border border-[var(--forge-border)] text-[var(--forge-fg)] py-3 rounded-lg font-bold uppercase tracking-wider text-center hover:bg-[oklch(0.15_0.02_40/0.6)] transition-colors"
              >
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {zoomOpen && activeImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setZoomOpen(false)}>
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            aria-label="Close image zoom"
          >
            <X className="w-8 h-8" />
          </button>
          <img src={activeImage} alt={product.name} className="max-w-full max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
