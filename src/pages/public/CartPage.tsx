import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { WatermarkedImage } from '../../components/ui/WatermarkedImage';
import { api } from '../../services/api';
import { loadRazorpayScript } from '../../utils/razorpay';
import type { Design, Order } from '../../types';

export function CartPage() {
  const { items, removeFromCart, clearCart } = useCart();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'cart' | 'pay'>('cart');
  const [createdOrders, setCreatedOrders] = useState<Order[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);

  const handleRazorpayPayment = async () => {
    if (createdOrders.length === 0) {
      showToast('No active order found to pay', 'error');
      return;
    }
    setIsRazorpayLoading(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        showToast('Failed to load Razorpay SDK. Please check your internet connection.', 'error');
        setIsRazorpayLoading(false);
        return;
      }

      const orderToPay = createdOrders[0];
      const razorpayData = await api.payments.createRazorpayOrder(orderToPay.id);

      const options = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: 'TexDesigner Marketplace',
        description: `Payment for ${razorpayData.designTitle || 'Textile Design'}`,
        order_id: razorpayData.razorpayOrderId,
        handler: async (response: any) => {
          try {
            setIsRazorpayLoading(true);
            await api.payments.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderToPay.id,
            });
            showToast('🎉 Payment Successful! Your order has been completed.', 'success');
            navigate('/customer/orders');
          } catch (err: any) {
            console.error(err);
            showToast(err.response?.data?.error || 'Payment verification failed', 'error');
          } finally {
            setIsRazorpayLoading(false);
          }
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '9876543210',
        },
        theme: {
          color: '#4F46E5',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        console.error('Razorpay Payment Failed:', response.error);
        showToast(`Payment Failed: ${response.error.description || 'Transaction cancelled'}`, 'error');
      });
      rzp.open();
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.error || 'Failed to initiate Razorpay payment', 'error');
    } finally {
      setIsRazorpayLoading(false);
    }
  };

  const [selectedLicenses, setSelectedLicenses] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    items.forEach(item => {
      init[item.design.id] = item.licenseType || (
        item.design.category === 'Weaving Design' 
          ? 'BMP' 
          : (item.design.category === 'Digital Print Design' || item.design.category === 'Position Print Design')
            ? 'PSD' 
            : 'EMB'
      );
    });
    return init;
  });

  const handleLicenseChange = (designId: string, license: string) => {
    setSelectedLicenses(prev => ({ ...prev, [designId]: license }));
  };

  const getPrice = (design: Design, license: string) => {
    if (license === 'Extended' || license === 'Other' || license === 'OTHER' || license === 'TIF') return design.price * 2.5;
    if (license === 'PDC') return design.pdcPrice && design.pdcPrice > 0 ? design.pdcPrice : design.price * 2.5;
    if (license === 'Exclusive Buyout' || license === 'Exclusive Global') return design.price * 8;
    return design.price;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const license = selectedLicenses[item.design.id] || (
        item.design.category === 'Weaving Design' 
          ? 'BMP' 
          : (item.design.category === 'Digital Print Design' || item.design.category === 'Position Print Design')
            ? 'PSD' 
            : 'EMB'
      );
      return sum + getPrice(item.design, license);
    }, 0);
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      const orderItems = items.map(item => {
        const license = selectedLicenses[item.design.id] || (
          item.design.category === 'Weaving Design' 
            ? 'BMP' 
            : (item.design.category === 'Digital Print Design' || item.design.category === 'Position Print Design')
              ? 'PSD' 
              : 'EMB'
        );
        return { designId: item.design.id, licenseType: license };
      });

      const res = await api.orders.create(undefined, undefined, orderItems);
      const orders = Array.isArray(res.data) ? res.data : [res.data];
      setCreatedOrders(orders);
      setTotalAmount(res.totalAmount ?? calculateTotal());
      await clearCart();
      setPaymentStep('pay');
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.error || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Payment Modal ──────────────────────────────────────────────────────────
  if (paymentStep === 'pay') {
    return (
      <div className="bg-surface min-h-[calc(100vh-4rem)] pb-24 pt-8">
        <div className="max-w-lg mx-auto px-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-8 text-sm font-semibold">
            <span className="text-primary flex items-center gap-1.5">
              <span className="w-6 h-6 bg-primary text-white rounded-full inline-flex items-center justify-center text-xs">✓</span>
              Order Placed
            </span>
            <div className="w-12 h-px bg-primary" />
            <span className="text-primary flex items-center gap-1.5">
              <span className="w-6 h-6 bg-primary text-white rounded-full inline-flex items-center justify-center text-xs font-bold">2</span>
              Razorpay Checkout
            </span>
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-primary px-6 py-4">
              <h2 className="text-white font-bold text-xl">Complete Your Payment</h2>
              <p className="text-white/70 text-sm mt-0.5">Pay securely online via Razorpay</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Amount */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Total Amount to Pay</p>
                  <p className="text-3xl font-bold text-primary mt-0.5">₹{totalAmount.toLocaleString()}</p>
                </div>
                <span className="material-symbols-outlined text-[40px] text-primary/30">currency_rupee</span>
              </div>

              {/* Razorpay Online Payment Option */}
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-6 shadow-lg space-y-4 border border-indigo-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-2xl animate-pulse">bolt</span>
                    <h3 className="font-bold text-white text-base">Pay Online via Razorpay</h3>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider bg-amber-400 text-slate-950 font-extrabold px-2.5 py-1 rounded-full shadow">Instant Approval</span>
                </div>
                <p className="text-xs text-indigo-200/90 leading-relaxed">
                  Pay securely using <strong>UPI, Google Pay, PhonePe, Paytm, Credit/Debit Cards, or NetBanking</strong>. Upon successful payment, your design files will be unlocked instantly for download!
                </p>
                <button
                  onClick={handleRazorpayPayment}
                  disabled={isRazorpayLoading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isRazorpayLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Opening Razorpay Checkout...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                      Pay ₹{totalAmount.toLocaleString()} Now
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-on-surface-variant flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-green-600 text-sm">lock</span>
                  100% Encrypted & Secure Payment via Razorpay
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Cart View ──────────────────────────────────────────────────────────────
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
                const license = selectedLicenses[item.design.id] || (
                  item.design.category === 'Weaving Design' 
                    ? 'BMP' 
                    : (item.design.category === 'Digital Print Design' || item.design.category === 'Position Print Design')
                      ? 'PSD' 
                      : 'EMB'
                );
                const basePrice = item.design.price;
                const itemPrice = getPrice(item.design, license);

                return (
                  <div key={item.design.id} className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-5 relative group overflow-hidden">
                    <div className="relative w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-surface-container shrink-0">
                      <WatermarkedImage
                        src={item.design.image}
                        alt={item.design.title}
                        density="compact"
                        className="w-full h-full object-cover"
                      />
                    </div>

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
                                {item.design.pdcPrice && item.design.pdcPrice > 0 ? (
                                  <option value="PDC">PDC Format</option>
                                ) : null}
                              </>
                            ) : (item.design.category === 'Digital Print Design' || item.design.category === 'Position Print Design') ? (
                              <>
                                <option value="PSD">PSD Format</option>
                                <option value="TIF">TIF Format</option>
                              </>
                            ) : (
                              <>
                                <option value="EMB">EMB Format</option>
                                <option value="OTHER">Other Format</option>
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
                  <span className="font-semibold text-primary-fixed-dim">FREE</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Tax</span>
                  <span className="font-semibold text-on-surface">₹0.00</span>
                </div>
                <div className="w-full h-px bg-outline-variant/50" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface">Total</span>
                  <span className="font-bold text-2xl text-primary">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* UPI Badge */}
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-4">
                <span className="material-symbols-outlined text-green-600 text-[18px]">qr_code_2</span>
                <p className="text-xs text-green-700 font-semibold">Pay via UPI / QR Code after placing order</p>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">payments</span>
                    Place Order & Pay
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-on-surface-variant mt-4 leading-relaxed">
                By purchasing, you agree to TexDesigner's License Agreement and Terms of Service.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
