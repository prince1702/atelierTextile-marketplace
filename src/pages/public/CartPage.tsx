import React, { useState, useRef } from 'react';
import { useCart } from '../../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { WatermarkedImage } from '../../components/ui/WatermarkedImage';
import { api } from '../../services/api';
import type { Design, Order } from '../../types';

const UPI_ID = 'dhavalhidad2600@okicici';
const UPI_NAME = 'TexDesigner';

export function CartPage() {
  const { items, removeFromCart, clearCart } = useCart();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'cart' | 'pay' | 'upload'>('cart');
  const [createdOrders, setCreatedOrders] = useState<Order[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitScreenshot = async () => {
    if (!screenshotFile || createdOrders.length === 0) return;
    setIsUploading(true);
    try {
      // Upload screenshot to the first order (all orders share the same payment)
      await Promise.all(
        createdOrders.map(order => api.orders.uploadPaymentScreenshot(order.id, screenshotFile))
      );
      showToast('Payment screenshot submitted! Awaiting admin approval.', 'success');
      navigate('/customer/orders');
    } catch (error: any) {
      console.error(error);
      showToast(error.response?.data?.error || 'Failed to upload screenshot', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Payment Modal ──────────────────────────────────────────────────────────
  if (paymentStep === 'pay' || paymentStep === 'upload') {
    return (
      <div className="bg-surface min-h-[calc(100vh-4rem)] pb-24 pt-8">
        <div className="max-w-lg mx-auto px-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8 text-sm font-semibold">
            <span className="text-primary flex items-center gap-1">
              <span className="w-6 h-6 bg-primary text-white rounded-full inline-flex items-center justify-center text-xs">✓</span>
              Order Placed
            </span>
            <div className="flex-1 h-px bg-primary mx-2 max-w-[60px]" />
            <span className={`flex items-center gap-1 ${paymentStep === 'pay' ? 'text-primary' : 'text-on-surface-variant'}`}>
              <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold border-2 ${paymentStep === 'pay' ? 'bg-primary text-white border-primary' : 'border-outline-variant text-outline'}`}>2</span>
              Pay via UPI
            </span>
            <div className="flex-1 h-px bg-outline-variant mx-2 max-w-[60px]" />
            <span className="text-on-surface-variant flex items-center gap-1">
              <span className="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold border-2 border-outline-variant text-outline">3</span>
              Upload Proof
            </span>
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-primary px-6 py-4">
              <h2 className="text-white font-bold text-xl">Complete Your Payment</h2>
              <p className="text-white/70 text-sm mt-0.5">Scan QR code or use UPI ID to pay ₹{totalAmount.toLocaleString()}</p>
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

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-3">Scan to Pay</p>
                <div className="border-4 border-primary/20 rounded-2xl p-2 shadow-sm">
                  <img
                    src="/upi-qr.png"
                    alt="UPI QR Code"
                    className="w-52 h-52 object-contain rounded-lg"
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-2">Works with Google Pay, PhonePe, Paytm, any UPI app</p>
                <div className="mt-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center gap-2 text-xs text-amber-800 font-semibold shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">schedule</span>
                  <span>Payment Verification Hours: 10:00 AM to 6:00 PM</span>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-xs text-on-surface-variant font-semibold">OR PAY USING UPI ID</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>

              {/* UPI ID */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low border border-outline-variant rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">account_balance_wallet</span>
                  <div className="min-w-0">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">UPI ID</p>
                    <p className="font-mono font-bold text-on-surface text-sm break-all mt-0.5">{UPI_ID}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Name: {UPI_NAME}</p>
                  </div>
                </div>
                <button
                  onClick={handleCopyUPI}
                  className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${copied ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                >
                  {copied ? '✓ Copied!' : 'Copy UPI ID'}
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 font-bold text-sm mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  Payment Instructions
                </p>
                <ol className="text-amber-700 text-xs space-y-1 list-decimal list-inside">
                  <li>Open any UPI app (Google Pay, PhonePe, Paytm)</li>
                  <li>Scan the QR code or enter the UPI ID above</li>
                  <li>Pay exactly <strong>₹{totalAmount.toLocaleString()}</strong></li>
                  <li>Take a screenshot of the success screen</li>
                  <li>Upload it below and click Submit</li>
                  <li>For any assistance, call Customer Care: <strong>8849590378</strong></li>
                </ol>
              </div>

              {/* Screenshot Upload */}
              <div>
                <p className="text-sm font-bold text-on-surface mb-3">Upload Payment Screenshot</p>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${screenshotPreview ? 'border-primary/40 bg-primary/5' : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'}`}
                >
                  {screenshotPreview ? (
                    <div className="space-y-2">
                      <img src={screenshotPreview} alt="Payment screenshot" className="max-h-48 mx-auto rounded-lg object-contain shadow" />
                      <p className="text-xs text-primary font-semibold">✓ {screenshotFile?.name}</p>
                      <p className="text-xs text-on-surface-variant">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="material-symbols-outlined text-[40px] text-outline">upload_file</span>
                      <p className="text-sm font-semibold text-on-surface">Click to upload screenshot</p>
                      <p className="text-xs text-on-surface-variant">JPG, PNG, WEBP — max 10MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitScreenshot}
                disabled={!screenshotFile || isUploading}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Submit Payment Proof
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-on-surface-variant">
                Your design will be unlocked once admin verifies the payment (usually within a few hours).
              </p>
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
