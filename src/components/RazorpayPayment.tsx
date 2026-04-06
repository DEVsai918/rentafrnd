import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Loader2, AlertCircle, Smartphone } from 'lucide-react';

interface RazorpayPaymentProps {
  amount: number;
  onSuccess: (response: any) => void;
  onCancel: () => void;
  userEmail: string;
  userPhone: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RazorpayPayment = ({ amount, onSuccess, onCancel, userEmail, userPhone }: RazorpayPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await loadRazorpayScript();

      if (!res) {
        setError('Razorpay SDK failed to load. Are you online?');
        setIsLoading(false);
        return;
      }

      // Create order on server
      const orderRes = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const orderData = await orderRes.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RentAFrnd',
        description: 'Booking Payment',
        order_id: orderData.id,
        handler: function (response: any) {
          onSuccess(response);
        },
        prefill: {
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: '#F27D26',
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong with Razorpay.');
      setIsLoading(false);
    }
  };

  if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
    return (
      <div className="p-8 glass-card rounded-[2.5rem] border border-yellow-500/20 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Razorpay Not Configured</h3>
        <p className="text-white/60 text-sm mb-6">
          Please set VITE_RAZORPAY_KEY_ID in your environment variables to enable Razorpay.
        </p>
        <button
          onClick={onCancel}
          className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full py-6 rounded-3xl bg-brand-primary text-white font-bold text-xl shadow-[0_20px_40px_rgba(242,125,38,0.3)] hover:shadow-[0_25px_50px_rgba(242,125,38,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            <Smartphone className="w-6 h-6" />
            Pay with Razorpay (₹{amount})
          </>
        )}
      </motion.button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-white/20 uppercase tracking-widest">
        <ShieldCheck className="w-3 h-3" />
        Secure Razorpay Payment
      </div>
    </div>
  );
};
