import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { api } from '../../services/api';
import type { Design } from '../../types';

export function CartPage() {
  const { items, removeFromCart, clearCart } = useCart();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep track of license selections for each item
  // key: design.id, value: license name
  const [selectedLicenses, setSelectedLicenses] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    items.forEach(item => {
      init[item.design.id] = item.licenseType || (item.design.category === 'Weaving Design' ? 'BMP' : 'Standard');
    });
    return init;
  });

  const handleLicenseChange = (designId: string, license: string) => {
    setSelectedLicenses(prev => ({
      ...prev,
      [designId]: license
    }));
  };

  const getPrice = (design: Design, license: string) => {
    if (license === 'Extended') return design.price * 2.5;
    if (license === 'PDC') {
      return design.pdcPrice && design.pdcPrice > 0 ? design.pdcPrice : design.price * 2.5;
    }
    if (license === 'Exclusive Buyout' || license === 'Exclusive Global') return design.price * 8;
    return design.price;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const license = selectedLicenses[item.design.id] || (item.design.category === 'Weaving Design' ? 'BMP' : 'Standard');
      return sum + getPrice(item.design, license);
    }, 0);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      // Prepare bulk order items
      const orderItems = items.map(item => {
        const license = selectedLicenses[item.design.id] || (item.design.category === 'Weaving Design' ? 'BMP' : 'Standard');
        const backendLicense = 
          license === 'Exclusive Buyout' || license === 'Exclusive Global' 
            ? 'Exclusive Global' 
            : (license === 'Extended' || license === 'PDC')
              ? 'Standard Regional' 
              : 'Open Regional';
        return {
          designId: item.design.id,
          licenseType: backendLicense
        };
      });

      // Call API to create order
      const response = await api.orders.create(undefined, undefined, orderItems);

      // If Razorpay order is not returned, it means server is running in mock mode
      if (!response.razorpayOrder) {
        await clearCart();
        showToast('Checkout successful! (Test/Mock Checkout)', 'success');
        navigate('/customer/orders');
        return;
      }

      // Load Razorpay Script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        showToast('Failed to load payment gateway. Please check your connection.', 'error');
        return;
      }

      // Configure Razorpay checkout options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || response.razorpayKeyId,
        amount: response.razorpayOrder.amount,
        currency: response.razorpayOrder.currency,
        name: 'AtelierTextile Marketplace',
        description: `Purchase of ${items.length} design(s)`,
        order_id: response.razorpayOrder.id,
        handler: async function (res: any) {
          try {
            setIsSubmitting(true);
            await api.orders.verifyPayment({
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_order_id: res.razorpay_order_id,
              razorpay_signature: res.razorpay_signature,
            });
            await clearCart();
            showToast('Payment successful! Your order has been placed.', 'success');
            navigate('/customer/orders');
          } catch (err: any) {
            console.error(err);
            showToast(err.response?.data?.error || 'Payment verification failed', 'error');
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#1E3A8A', // Sleek dark navy theme
        },
        modal: {
          ondismiss: function () {
            showToast('Payment cancelled.', 'info');
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.error || 'Failed to initiate checkout', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface min-h-[calc(100vh-4rem)] pb-24 pt-8">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 animate-fade-in">
        <h1 className="text-3xl font-bold text-primary mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-[32px]">shopping_cart</span>
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-outline-variant shadow-sm max-w-lg mx-auto">
            <span className="material-symbols-outlined text-[64px] text-outline mb-4">production_quantity_limits</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Your cart is empty</h3>
            <p className="text-on-surface-variant mb-8">Discover beautiful production-ready textile patterns in our marketplace.</p>
            <Link to="/marketplace" className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-container transition-colors shadow-sm">
              Go to Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-6">
              {items.map(item => {
                const license = selectedLicenses[item.design.id] || (item.design.category === 'Weaving Design' ? 'BMP' : 'Standard');
                const basePrice = item.design.price;
                const itemPrice = getPrice(item.design, license);

                return (
                  <div key={item.design.id} className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-5 relative group overflow-hidden">
                    <img 
                      src={item.design.image} 
                      alt={item.design.title} 
                      className="w-full sm:w-36 h-36 rounded-xl object-cover bg-surface-container shrink-0" 
                    />
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <div>
                            <h3 className="font-bold text-on-surface text-lg leading-tight group-hover:text-primary transition-colors">{item.design.title}</h3>
                            <p className="text-xs text-on-surface-variant mt-1">by <span className="font-semibold text-primary">{item.design.designerName}</span></p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.design.id)}
                            className="text-on-surface-variant hover:text-error hover:bg-error-container/20 p-2 rounded-full transition-colors shrink-0"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>

                        {/* License Select dropdown */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
                          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">License / Format:</label>
                          <select 
                            value={license} 
                            onChange={(e) => handleLicenseChange(item.design.id, e.target.value)}
                            className="border border-outline-variant bg-surface-container-low rounded-lg px-3 py-1.5 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary cursor-pointer w-full sm:w-fit"
                          >
                            {item.design.category === 'Weaving Design' ? (
                              <>
                                <option value="BMP">BMP Format</option>
                                <option value="PDC">PDC Format</option>
                              </>
                            ) : (
                              <>
                                <option value="Standard">Standard License (Digital/Print)</option>
                                <option value="Extended">Extended License (Commercial)</option>
                                <option value="Exclusive Buyout">Exclusive Buyout (Full Ownership)</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-6 border-t border-outline-variant/30 pt-3">
                        <span className="text-xs text-on-surface-variant">Base Price: ₹{basePrice}</span>
                        <div className="text-right">
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">License Price</p>
                          <p className="text-lg font-bold text-primary">₹{itemPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4 bg-white border border-outline-variant rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-bold text-primary text-xl mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Items ({items.length})</span>
                  <span className="font-semibold text-on-surface">₹{calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Platform Fee</span>
                  <span className="font-semibold text-on-surface text-primary-fixed-dim">FREE</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Tax</span>
                  <span className="font-semibold text-on-surface">₹0.00</span>
                </div>
                <div className="w-full h-px bg-outline-variant/50"></div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface">Total</span>
                  <span className="font-bold text-2xl text-primary">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Orders...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">payments</span>
                    Place Order
                  </>
                )}
              </button>
              
              <p className="text-[11px] text-center text-on-surface-variant mt-4 leading-relaxed">
                By purchasing, you agree to AtelierTextile's License Agreement and Terms of Service.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
