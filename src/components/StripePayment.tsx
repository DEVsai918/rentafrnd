import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { motion } from 'motion/react';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm = ({ amount, onSuccess, onCancel }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred.");
      } else {
        setMessage("An unexpected error occurred.");
      }
    } else {
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      
      {message && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {message}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <motion.button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-6 rounded-3xl bg-brand-primary text-white font-bold text-xl shadow-[0_20px_40px_rgba(242,125,38,0.3)] hover:shadow-[0_25px_50px_rgba(242,125,38,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            `Pay ₹${amount}`
          )}
        </motion.button>
        
        <button
          type="button"
          onClick={onCancel}
          className="text-white/40 text-sm hover:text-white transition-colors"
        >
          Cancel and go back
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-white/20 uppercase tracking-widest">
        <ShieldCheck className="w-3 h-3" />
        Secure SSL Encrypted Payment
      </div>
    </form>
  );
};

interface StripePaymentProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const StripePayment = ({ amount, onSuccess, onCancel }: StripePaymentProps) => {
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to initialize payment");
        return res.json();
      })
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => {
        console.error(err);
        setError("Could not connect to payment server. Please ensure STRIPE_SECRET_KEY is set.");
      });
  }, [amount]);

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#F27D26',
      colorBackground: '#151619',
      colorText: '#ffffff',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '16px',
    },
  };

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  if (error) {
    return (
      <div className="p-8 glass-card rounded-[2.5rem] border border-red-500/20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Payment Error</h3>
        <p className="text-white/60 text-sm mb-6">{error}</p>
        <button
          onClick={onCancel}
          className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="p-8 glass-card rounded-[2.5rem] border border-yellow-500/20 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Stripe Not Configured</h3>
        <p className="text-white/60 text-sm mb-6">
          Please set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables to enable payments.
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
    <div className="w-full">
      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
        </Elements>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
          <p className="text-white/40 text-sm animate-pulse">Initializing secure payment...</p>
        </div>
      )}
    </div>
  );
};
